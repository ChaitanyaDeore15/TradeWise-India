from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import User, PaperAccount, PaperPosition, PaperOrder
from app.schemas.schemas import PaperOrderCreate, PaperAccountResponse
from app.services.market_data.provider import market_data_provider

router = APIRouter()

def _get_or_create_account(db: Session, user: User) -> PaperAccount:
    account = db.query(PaperAccount).filter(PaperAccount.user_id == user.id).first()
    if not account:
        account = PaperAccount(
            user_id=user.id,
            account_number=f"TW-PAPER-{user.id + 10000}",
            balance=1000000.0,
            initial_balance=1000000.0,
            realized_pnl=0.0
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account

@router.get("/account", response_model=PaperAccountResponse)
def get_paper_account(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Retrieve virtual trading portfolio, positions, and cash balance."""
    # If unauthenticated, retrieve demo account
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
        if not user:
            raise HTTPException(status_code=400, detail="Demo account not initialized.")

    account = _get_or_create_account(db, user)
    positions = db.query(PaperPosition).filter(PaperPosition.account_id == account.id).all()
    recent_orders = (
        db.query(PaperOrder)
        .filter(PaperOrder.account_id == account.id)
        .order_by(PaperOrder.executed_at.desc())
        .limit(20)
        .all()
    )

    # Update current market price & unrealized P&L for open positions
    unrealized_total = 0.0
    for pos in positions:
        quote = market_data_provider.get_quote(pos.symbol)
        if quote:
            pos.current_price = quote["last_price"]
            pos.unrealized_pnl = round((pos.current_price - pos.average_entry_price) * pos.quantity, 2)
            unrealized_total += pos.unrealized_pnl

    total_equity = account.balance + unrealized_total + sum(p.average_entry_price * p.quantity for p in positions)

    return {
        "id": account.id,
        "account_number": account.account_number,
        "balance": round(account.balance, 2),
        "initial_balance": account.initial_balance,
        "realized_pnl": round(account.realized_pnl, 2),
        "unrealized_pnl": round(unrealized_total, 2),
        "total_equity": round(total_equity, 2),
        "positions": positions,
        "recent_orders": recent_orders
    }

@router.post("/order")
def place_paper_order(
    order_in: PaperOrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Execute a simulated educational order against market quote with realistic costs."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
        if not user:
            raise HTTPException(status_code=400, detail="Demo account not found.")

    account = _get_or_create_account(db, user)
    quote = market_data_provider.get_quote(order_in.symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Instrument '{order_in.symbol}' not found.")

    exec_price = quote["last_price"]
    turnover = exec_price * order_in.quantity
    
    # Calculate Indian statutory charges
    brokerage = min(20.0, turnover * 0.0003)
    stt = turnover * 0.001
    exchange_fees = turnover * 0.0000345
    gst = (brokerage + exchange_fees) * 0.18
    stamp_duty = (turnover * 0.00015) if order_in.side == "BUY" else 0.0
    total_fees = round(brokerage + stt + exchange_fees + gst + stamp_duty, 2)

    position = (
        db.query(PaperPosition)
        .filter(PaperPosition.account_id == account.id, PaperPosition.symbol == order_in.symbol)
        .first()
    )

    if order_in.side == "BUY":
        total_required = turnover + total_fees
        if account.balance < total_required:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient virtual cash balance. Required: ₹{total_required:,.2f}, Available: ₹{account.balance:,.2f}"
            )
        account.balance -= total_required

        if position:
            new_qty = position.quantity + order_in.quantity
            position.average_entry_price = (
                (position.average_entry_price * position.quantity) + turnover
            ) / new_qty
            position.quantity = new_qty
            position.current_price = exec_price
        else:
            position = PaperPosition(
                account_id=account.id,
                symbol=order_in.symbol,
                quantity=order_in.quantity,
                average_entry_price=exec_price,
                current_price=exec_price,
                unrealized_pnl=0.0
            )
            db.add(position)

    elif order_in.side == "SELL":
        if not position or position.quantity < order_in.quantity:
            current_holding = position.quantity if position else 0
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient holdings to sell. You hold {current_holding} shares."
            )
        
        realized_gain = (exec_price - position.average_entry_price) * order_in.quantity - total_fees
        account.balance += (turnover - total_fees)
        account.realized_pnl += realized_gain
        position.quantity -= order_in.quantity

        if position.quantity == 0:
            db.delete(position)
        else:
            position.current_price = exec_price

    # Record order
    order = PaperOrder(
        account_id=account.id,
        symbol=order_in.symbol,
        side=order_in.side,
        order_type=order_in.order_type,
        quantity=order_in.quantity,
        price=exec_price,
        status="EXECUTED",
        estimated_fees=total_fees
    )
    db.add(order)
    db.commit()

    return {
        "message": f"Successfully simulated {order_in.side} execution of {order_in.quantity} shares of {order_in.symbol}.",
        "execution_price": exec_price,
        "estimated_fees": total_fees,
        "new_balance": round(account.balance, 2)
    }

@router.post("/reset")
def reset_paper_account(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Reset virtual account to initial ₹10,00,000 starting cash."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()

    account = _get_or_create_account(db, user)
    db.query(PaperPosition).filter(PaperPosition.account_id == account.id).delete()
    db.query(PaperOrder).filter(PaperOrder.account_id == account.id).delete()
    account.balance = 1000000.0
    account.initial_balance = 1000000.0
    account.realized_pnl = 0.0
    db.commit()

    return {"message": "Paper trading portfolio successfully reset to ₹10,00,000 virtual balance."}
