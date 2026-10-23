import {
  User, Instrument, MarketBar, MarketOverview, Course, LessonDetail,
  BacktestRequest, BacktestResponse, PaperAccount,
  PositionSizeResult, StressTestResult, AITutorResponse
} from "../types";

const API_BASE = "/api/v1";

class ApiService {
  private token: string | null = localStorage.getItem("tradewise_token");

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("tradewise_token", token);
    } else {
      localStorage.removeItem("tradewise_token");
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown network error occurred" }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async guestLogin(): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>("/auth/guest-login", {
      method: "POST"
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // Markets
  async getInstruments(): Promise<Instrument[]> {
    return this.request<Instrument[]>("/markets/instruments");
  }

  async getMarketOverview(): Promise<MarketOverview> {
    return this.request<MarketOverview>("/markets/market-overview");
  }

  async getBars(symbol: string, interval = "1d", limit = 120): Promise<MarketBar[]> {
    return this.request<MarketBar[]>(`/markets/bars/${symbol}?interval=${interval}&limit=${limit}`);
  }

  // Academy
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>("/academy/courses");
  }

  async getLesson(slug: string): Promise<LessonDetail> {
    return this.request<LessonDetail>(`/academy/lessons/${slug}`);
  }

  async submitQuiz(quizId: number, selectedIndex: number): Promise<{
    quiz_id: number;
    is_correct: boolean;
    correct_option_index: number;
    explanation: string;
  }> {
    return this.request("/academy/quizzes/submit", {
      method: "POST",
      body: JSON.stringify({ quiz_id: quizId, selected_option_index: selectedIndex })
    });
  }

  // Strategy Lab / Backtests
  async runBacktest(req: BacktestRequest): Promise<BacktestResponse> {
    return this.request<BacktestResponse>("/backtests/run", {
      method: "POST",
      body: JSON.stringify(req)
    });
  }

  // Paper Trading
  async getPaperAccount(): Promise<PaperAccount> {
    return this.request<PaperAccount>("/paper-trading/account");
  }

  async placePaperOrder(symbol: string, side: "BUY" | "SELL", quantity: number): Promise<any> {
    return this.request("/paper-trading/order", {
      method: "POST",
      body: JSON.stringify({ symbol, side, quantity, order_type: "MARKET" })
    });
  }

  async resetPaperAccount(): Promise<any> {
    return this.request("/paper-trading/reset", {
      method: "POST"
    });
  }

  // Risk Studio
  async calculatePositionSize(
    accountCapital: number,
    riskPercentage: number,
    entryPrice: number,
    stopLossPrice: number
  ): Promise<PositionSizeResult> {
    return this.request<PositionSizeResult>("/risk/position-size", {
      method: "POST",
      body: JSON.stringify({
        account_capital: accountCapital,
        risk_percentage: riskPercentage,
        entry_price: entryPrice,
        stop_loss_price: stopLossPrice
      })
    });
  }

  async runStressTest(portfolioValue: number, scenario: string): Promise<StressTestResult> {
    return this.request<StressTestResult>("/risk/stress-test", {
      method: "POST",
      body: JSON.stringify({
        portfolio_value: portfolioValue,
        scenario
      })
    });
  }

  // AI Tutor
  async queryAITutor(query: string): Promise<AITutorResponse> {
    return this.request<AITutorResponse>("/ai-tutor/query", {
      method: "POST",
      body: JSON.stringify({ query })
    });
  }
}

export const api = new ApiService();
