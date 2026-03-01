import { useState, useContext, useCallback, memo } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import qaApi from 'src/apis/qa.api'
import { ProductQuestion, ProductAnswer } from 'src/types/qa.type'
import { AppContext } from 'src/contexts/app.context'

interface ProductQAProps {
  productId: string
  className?: string
}

const ITEMS_PER_PAGE = 5

const ProductQA = memo(function ProductQA({ productId, className = '' }: ProductQAProps) {
  const { isAuthenticated } = useContext(AppContext)
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked' | 'most_answered'>('newest')
  const [questionText, setQuestionText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

  const queryClient = useQueryClient()

  // Use useInfiniteQuery for proper pagination with load more
  const {
    data: questionsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['product-qa', productId, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      qaApi.getQuestions({
        product_id: productId,
        page: pageParam,
        limit: ITEMS_PER_PAGE,
        sort_by: sortBy
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage.data.data.pagination
      const currentPage = allPages.length
      if (currentPage * ITEMS_PER_PAGE < pagination.total) {
        return currentPage + 1
      }
      return undefined
    },
    initialPageParam: 1
  })

  const askQuestionMutation = useMutation({
    mutationFn: qaApi.askQuestion,
    onSuccess: () => {
      toast.success('Đặt câu hỏi thành công!')
      setQuestionText('')
      queryClient.invalidateQueries({ queryKey: ['product-qa', productId] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi đặt câu hỏi')
    }
  })

  const answerQuestionMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) =>
      qaApi.answerQuestion(questionId, { answer }),
    onSuccess: () => {
      toast.success('Trả lời thành công!')
      setAnswerText('')
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ['product-qa', productId] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi trả lời')
    }
  })

  const likeQuestionMutation = useMutation({
    mutationFn: qaApi.likeQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-qa', productId] })
    }
  })

  const likeAnswerMutation = useMutation({
    mutationFn: ({ questionId, answerId }: { questionId: string; answerId: string }) =>
      qaApi.likeAnswer(questionId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-qa', productId] })
    }
  })

  // Flatten all pages into a single array of questions
  const questions = questionsData?.pages.flatMap((page) => page.data.data.questions) || []
  const totalQuestions = questionsData?.pages[0]?.data.data.pagination.total || 0

  const handleAskQuestion = useCallback(() => {
    if (!questionText.trim()) return
    askQuestionMutation.mutate({ product_id: productId, question: questionText.trim() })
  }, [questionText, productId, askQuestionMutation])

  const handleAnswerQuestion = useCallback(
    (questionId: string) => {
      if (!answerText.trim()) return
      answerQuestionMutation.mutate({ questionId, answer: answerText.trim() })
    },
    [answerText, answerQuestionMutation]
  )

  const handleLikeQuestion = useCallback(
    (questionId: string) => {
      if (!isAuthenticated) {
        toast.warning('Vui lòng đăng nhập để thích câu hỏi')
        return
      }
      likeQuestionMutation.mutate(questionId)
    },
    [isAuthenticated, likeQuestionMutation]
  )

  const handleLikeAnswer = useCallback(
    (questionId: string, answerId: string) => {
      if (!isAuthenticated) {
        toast.warning('Vui lòng đăng nhập để thích câu trả lời')
        return
      }
      likeAnswerMutation.mutate({ questionId, answerId })
    },
    [isAuthenticated, likeAnswerMutation]
  )

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return <QALoadingSkeleton className={className} />
  }

  return (
    <div className={`rounded-sm bg-white p-4 shadow-sm md:p-6 dark:bg-slate-800 ${className}`}>
      <h2 className='mb-6 text-lg font-semibold text-gray-800 md:text-xl dark:text-gray-200'>HỎI ĐÁP VỀ SẢN PHẨM</h2>

      {/* Ask Question Form */}
      <div className='mb-6 rounded-lg bg-gray-50 p-4 dark:bg-slate-700'>
        <h3 id='ask-question-heading' className='mb-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
          Đặt câu hỏi cho người bán
        </h3>
        {isAuthenticated ? (
          <div>
            <label htmlFor='question-textarea' className='sr-only'>
              Nhập câu hỏi của bạn về sản phẩm
            </label>
            <textarea
              id='question-textarea'
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder='Nhập câu hỏi của bạn về sản phẩm...'
              className='w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100'
              rows={3}
              aria-describedby='ask-question-heading'
            />
            <div className='mt-2 flex justify-end'>
              <button
                onClick={handleAskQuestion}
                disabled={askQuestionMutation.isPending || !questionText.trim()}
                className='rounded-sm bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
                aria-label='Gửi câu hỏi về sản phẩm'
              >
                {askQuestionMutation.isPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
              </button>
            </div>
          </div>
        ) : (
          <div className='py-4 text-center'>
            <p className='mb-2 text-gray-500 dark:text-gray-400'>Vui lòng đăng nhập để đặt câu hỏi</p>
            <a href='/login' className='font-medium text-orange-500 hover:text-orange-600'>
              Đăng nhập ngay
            </a>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className='mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-700'>
        <span className='text-sm text-gray-600 dark:text-gray-400'>{totalQuestions} câu hỏi</span>
        <div className='flex items-center space-x-2'>
          <label htmlFor='sort-select' className='text-sm text-gray-600 dark:text-gray-400'>
            Sắp xếp:
          </label>
          <select
            id='sort-select'
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className='rounded-sm border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
            aria-label='Sắp xếp câu hỏi'
          >
            <option value='newest'>Mới nhất</option>
            <option value='most_liked'>Nhiều like nhất</option>
            <option value='most_answered'>Nhiều trả lời nhất</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <QAEmptyState />
      ) : (
        <div className='space-y-6' role='list' aria-live='polite' aria-label='Danh sách câu hỏi'>
          {questions.map((question: ProductQuestion) => (
            <QuestionItem
              key={question._id}
              question={question}
              onLikeQuestion={handleLikeQuestion}
              onLikeAnswer={handleLikeAnswer}
              isReplying={replyingTo === question._id}
              onToggleReply={() => setReplyingTo(replyingTo === question._id ? null : question._id)}
              answerText={answerText}
              setAnswerText={setAnswerText}
              onSubmitAnswer={() => handleAnswerQuestion(question._id)}
              isSubmitting={answerQuestionMutation.isPending}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <div className='mt-6 flex justify-center' aria-live='polite'>
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className='rounded-sm border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
            aria-label='Tải thêm câu hỏi'
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm câu hỏi'}
          </button>
        </div>
      )}
    </div>
  )
})

interface QuestionItemProps {
  question: ProductQuestion
  onLikeQuestion: (questionId: string) => void
  onLikeAnswer: (questionId: string, answerId: string) => void
  isReplying: boolean
  onToggleReply: () => void
  answerText: string
  setAnswerText: (text: string) => void
  onSubmitAnswer: () => void
  isSubmitting: boolean
  isAuthenticated: boolean
}

const QuestionItem = memo(function QuestionItem({
  question,
  onLikeQuestion,
  onLikeAnswer,
  isReplying,
  onToggleReply,
  answerText,
  setAnswerText,
  onSubmitAnswer,
  isSubmitting,
  isAuthenticated
}: QuestionItemProps) {
  const replyFormId = `reply-form-${question._id}`
  const answerTextareaId = `answer-textarea-${question._id}`

  return (
    <div className='rounded-lg border border-gray-200 p-4 dark:border-slate-700' role='listitem'>
      {/* Question Header */}
      <div className='flex items-start space-x-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-slate-600'>
          {question.user.avatar ? (
            <img src={question.user.avatar} alt={question.user.name} className='h-10 w-10 rounded-full object-cover' />
          ) : (
            <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              {question.user.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className='flex-1'>
          <div className='mb-1 flex items-center space-x-2'>
            <span className='font-medium text-gray-800 dark:text-gray-200'>{question.user.name}</span>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
          <p className='text-gray-700 dark:text-gray-300'>{question.question}</p>

          {/* Question Actions */}
          <div className='mt-2 flex items-center space-x-4 text-sm'>
            <button
              onClick={() => onLikeQuestion(question._id)}
              className={`flex items-center space-x-1 ${question.is_liked ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'} hover:text-orange-500`}
              aria-label={`Thích câu hỏi, ${question.likes_count} lượt thích`}
              aria-pressed={question.is_liked}
            >
              <svg className='h-4 w-4 fill-current' viewBox='0 0 20 20' aria-hidden='true'>
                <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
              </svg>
              <span>{question.likes_count}</span>
            </button>
            <button
              onClick={onToggleReply}
              className='text-gray-500 hover:text-orange-500 dark:text-gray-400'
              aria-expanded={isReplying}
              aria-controls={replyFormId}
              aria-label={`Trả lời câu hỏi, ${question.answers.length} câu trả lời`}
            >
              Trả lời ({question.answers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Answers */}
      {question.answers.length > 0 && (
        <div
          className='mt-4 ml-13 space-y-3 border-l-2 border-gray-200 pl-4 dark:border-slate-600'
          role='list'
          aria-label='Danh sách câu trả lời'
        >
          {question.answers.map((answer: ProductAnswer) => (
            <AnswerItem key={answer._id} answer={answer} questionId={question._id} onLikeAnswer={onLikeAnswer} />
          ))}
        </div>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className='mt-4 ml-13 pl-4' id={replyFormId}>
          {isAuthenticated ? (
            <div>
              <label htmlFor={answerTextareaId} className='sr-only'>
                Nhập câu trả lời của bạn
              </label>
              <textarea
                id={answerTextareaId}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder='Nhập câu trả lời của bạn...'
                className='w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
                rows={2}
                aria-describedby={`${answerTextareaId}-hint`}
              />
              <span id={`${answerTextareaId}-hint`} className='sr-only'>
                Nhập câu trả lời cho câu hỏi này
              </span>
              <div className='mt-2 flex justify-end space-x-2'>
                <button
                  onClick={onToggleReply}
                  className='rounded-sm border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                  aria-label='Hủy trả lời'
                >
                  Hủy
                </button>
                <button
                  onClick={onSubmitAnswer}
                  disabled={isSubmitting || !answerText.trim()}
                  className='rounded-sm bg-orange-500 px-3 py-1 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
                  aria-label='Gửi câu trả lời'
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          ) : (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Vui lòng{' '}
              <a href='/login' className='text-orange-500 hover:text-orange-600'>
                đăng nhập
              </a>{' '}
              để trả lời câu hỏi
            </p>
          )}
        </div>
      )}
    </div>
  )
})

interface AnswerItemProps {
  answer: ProductAnswer
  questionId: string
  onLikeAnswer: (questionId: string, answerId: string) => void
}

const AnswerItem = memo(function AnswerItem({ answer, questionId, onLikeAnswer }: AnswerItemProps) {
  return (
    <div className='flex items-start space-x-3' role='listitem'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-slate-600'>
        {answer.user.avatar ? (
          <img src={answer.user.avatar} alt={answer.user.name} className='h-8 w-8 rounded-full object-cover' />
        ) : (
          <span className='text-xs font-medium text-gray-600 dark:text-gray-300'>
            {answer.user.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className='flex-1'>
        <div className='mb-1 flex items-center space-x-2'>
          <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>{answer.user.name}</span>
          {answer.user.is_seller && (
            <span className='rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
              Người bán
            </span>
          )}
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: vi })}
          </span>
        </div>
        <p className='text-sm text-gray-700 dark:text-gray-300'>{answer.answer}</p>
        <button
          onClick={() => onLikeAnswer(questionId, answer._id)}
          className={`mt-1 flex items-center space-x-1 text-xs ${answer.is_liked ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'} hover:text-orange-500`}
          aria-label={`Thích câu trả lời, ${answer.likes_count} lượt thích`}
          aria-pressed={answer.is_liked}
        >
          <svg className='h-3 w-3 fill-current' viewBox='0 0 20 20' aria-hidden='true'>
            <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
          </svg>
          <span>{answer.likes_count}</span>
        </button>
      </div>
    </div>
  )
})

const QALoadingSkeleton = memo(function QALoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`min-h-[400px] rounded-sm bg-white p-4 shadow-sm md:p-6 dark:bg-slate-800 ${className}`}
      aria-label='Đang tải câu hỏi'
      role='status'
    >
      <div className='animate-pulse'>
        <div className='mb-6 h-6 w-1/3 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
        <div className='mb-6 h-24 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='rounded-lg border border-gray-200 p-4 dark:border-slate-700'>
              <div className='flex items-start space-x-3'>
                <div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700'></div>
                <div className='flex-1'>
                  <div className='mb-2 h-4 w-1/4 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
                  <div className='mb-2 h-4 w-full rounded-sm bg-gray-200 dark:bg-slate-700'></div>
                  <div className='h-4 w-3/4 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

const QAEmptyState = memo(function QAEmptyState() {
  return (
    <div className='py-8 text-center' role='status'>
      <svg
        className='mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
          d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <p className='text-gray-500 dark:text-gray-400'>Chưa có câu hỏi nào về sản phẩm này</p>
      <p className='mt-1 text-sm text-gray-400 dark:text-gray-500'>Hãy là người đầu tiên đặt câu hỏi!</p>
    </div>
  )
})

export default ProductQA
