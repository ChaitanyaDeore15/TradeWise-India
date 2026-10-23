import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Clock, ChevronRight, Award, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import { Course, LessonDetail, Quiz } from "../../types";

export const AcademyView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResults, setQuizResults] = useState<Record<number, { is_correct: boolean; explanation: string; correct_index: number }>>({});

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleOpenLesson = async (slug: string) => {
    setLessonLoading(true);
    setQuizAnswers({});
    setQuizResults({});
    try {
      const lesson = await api.getLesson(slug);
      setSelectedLesson(lesson);
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleSelectQuizOption = (quizId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [quizId]: optionIdx }));
  };

  const handleSubmitQuiz = async (quizId: number) => {
    const selectedIdx = quizAnswers[quizId];
    if (selectedIdx === undefined) return;
    try {
      const res = await api.submitQuiz(quizId, selectedIdx);
      setQuizResults(prev => ({
        ...prev,
        [quizId]: {
          is_correct: res.is_correct,
          explanation: res.explanation,
          correct_index: res.correct_option_index
        }
      }));
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Loading Trading Academy Curriculum...
      </div>
    );
  }

  // Active Lesson Reader View
  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedLesson(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[#2DD4BF] hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Curriculum
        </button>

        <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-6 lg:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2DD4BF] font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedLesson.duration_minutes} mins study time</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Lesson #{selectedLesson.order}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{selectedLesson.title}</h1>
            {selectedLesson.summary && (
              <p className="text-sm text-slate-300 mt-2">{selectedLesson.summary}</p>
            )}
          </div>

          {/* Learning Objectives Box */}
          {selectedLesson.learning_objectives?.length > 0 && (
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#2DD4BF]" /> Key Learning Objectives
              </h3>
              <ul className="text-xs text-slate-300 space-y-1 pl-5 list-disc">
                {selectedLesson.learning_objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lesson Content Markdown Render */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed border-t border-[#1E293B] pt-6">
            <div
              className="whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{
                __html: selectedLesson.content_markdown
                  .replace(/# (.*)/g, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
                  .replace(/### (.*)/g, '<h3 class="text-base font-semibold text-[#2DD4BF] mt-3 mb-1">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              }}
            />
          </div>

          {/* Interactive Knowledge Checks / Quizzes */}
          {selectedLesson.quizzes?.length > 0 && (
            <div className="border-t border-[#1E293B] pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2DD4BF]" />
                <h3 className="text-base font-bold text-white">Knowledge Check & Concept Verification</h3>
              </div>

              <div className="space-y-4">
                {selectedLesson.quizzes.map((quiz) => {
                  const result = quizResults[quiz.id];
                  const hasAnswered = result !== undefined;

                  return (
                    <div key={quiz.id} className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-5 space-y-4">
                      <p className="text-sm font-medium text-white">{quiz.question}</p>
                      <div className="space-y-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[quiz.id] === optIdx;
                          let optStyle = "border-[#1E293B] bg-[#111C2E] text-slate-300 hover:border-slate-700";

                          if (hasAnswered) {
                            if (optIdx === result.correct_index) {
                              optStyle = "border-[#10B981] bg-[#10B981]/10 text-emerald-300 font-semibold";
                            } else if (isSelected && !result.is_correct) {
                              optStyle = "border-[#EF4444] bg-[#EF4444]/10 text-red-300";
                            }
                          } else if (isSelected) {
                            optStyle = "border-[#2DD4BF] bg-[#2DD4BF]/10 text-white";
                          }

                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${optStyle}`}
                            >
                              <input
                                type="radio"
                                name={`quiz-${quiz.id}`}
                                disabled={hasAnswered}
                                checked={isSelected}
                                onChange={() => handleSelectQuizOption(quiz.id, optIdx)}
                                className="text-[#2DD4BF] focus:ring-0"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {!hasAnswered ? (
                        <button
                          onClick={() => handleSubmitQuiz(quiz.id)}
                          disabled={quizAnswers[quiz.id] === undefined}
                          className="px-4 py-2 bg-[#2DD4BF] disabled:opacity-40 hover:bg-[#14B8A6] text-[#0B1220] font-semibold text-xs rounded-lg transition-colors"
                        >
                          Verify Answer
                        </button>
                      ) : (
                        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                          result.is_correct ? "bg-emerald-950/30 border-[#10B981]/40 text-emerald-200" : "bg-red-950/30 border-[#EF4444]/40 text-red-200"
                        }`}>
                          <p className="font-bold mb-1">
                            {result.is_correct ? "✓ Correct!" : "✗ Concept Review Needed"}
                          </p>
                          <p>{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Course Overview / Track Browser
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Trading Academy <span className="text-xs px-2 py-0.5 rounded bg-[#2DD4BF]/15 text-[#2DD4BF] font-mono">SEBI Grounded</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Structured learning tracks designed for Indian markets. Master exchange structures, technical indicators, and quantitative risk management.
        </p>
      </div>

      {/* Courses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const difficultyBadge =
            course.difficulty === "beginner"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : course.difficulty === "intermediate"
              ? "bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30"
              : "bg-purple-500/15 text-purple-400 border-purple-500/30";

          return (
            <div
              key={course.id}
              className="bg-[#111C2E] border border-[#1E293B] hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${difficultyBadge}`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.estimated_hours}h</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{course.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1E293B] space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Curriculum ({course.lessons.length} Modules):
                </div>
                <div className="space-y-1.5">
                  {course.lessons.map((lesson) => (
                    <button
                      key={lesson.slug}
                      onClick={() => handleOpenLesson(lesson.slug)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0B1220] hover:bg-[#162235] border border-[#1E293B] text-left text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="truncate pr-2 font-medium">{lesson.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
