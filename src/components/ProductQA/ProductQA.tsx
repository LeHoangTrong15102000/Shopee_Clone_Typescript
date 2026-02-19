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

  const handleAnswerQuestion = useCallback((questionId: string) => {
    if (!answerText.trim()) return
    answerQuestionMutation.mutate({ questionId, answer: answerText.trim() })
  }, [answerText, answerQuestionMutation])

  const handleLikeQuestion = useCallback((questionId: string) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thích câu hỏi')
      return
    }
    likeQuestionMutation.mutate(questionId)
  }, [isAuthenticated, likeQuestionMutation])

  const handleLikeAnswer = useCallback((questionId: string, answerId: string) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thích câu trả lời')
      return
    }
    likeAnswerMutation.mutate({ questionId, answerId })
  }, [isAuthenticated, likeAnswerMutation])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return <QALoadingSkeleton className={className} />
  }

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 md:p-6 shadow rounded ${className}`}>
      <h2 className='text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6'>HỎI ĐÁP VỀ SẢN PHẨM</h2>

      {/* Ask Question Form */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg'>
        <h3 id='ask-question-heading' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
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
              className='w-full p-3 border border-gray-300 dark:border-slate-600 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100'
              rows={3}
              aria-describedby='ask-question-heading'
            />
            <div className='flex justify-end mt-2'>
              <button
                onClick={handleAskQuestion}
                disabled={askQuestionMutation.isPending || !questionText.trim()}
                className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                aria-label='Gửi câu hỏi về sản phẩm'
              >
                {askQuestionMutation.isPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
              </button>
            </div>
          </div>
        ) : (
          <div className='text-center py-4'>
            <p className='text-gray-500 dark:text-gray-400 mb-2'>Vui lòng đăng nhập để đặt câu hỏi</p>
            <a href='/login' className='text-orange-500 hover:text-orange-600 font-medium'>
              Đăng nhập ngay
            </a>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className='flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-3'>
        <span className='text-sm text-gray-600 dark:text-gray-400'>{totalQuestions} câu hỏi</span>
        <div className='flex items-center space-x-2'>
          <label htmlFor='sort-select' className='text-sm text-gray-600 dark:text-gray-400'>
            Sắp xếp:
          </label>
          <select
            id='sort-select'
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className='px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100'
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
        <div className='flex justify-center mt-6' aria-live='polite'>
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className='px-6 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
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
    <div className='border border-gray-200 dark:border-slate-700 rounded-lg p-4' role='listitem'>
      {/* Question Header */}
      <div className='flex items-start space-x-3'>
        <div className='w-10 h-10 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0'>
          {question.user.avatar ? (
            <img src={question.user.avatar} alt={question.user.name} className='w-10 h-10 rounded-full object-cover' />
          ) : (
            <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>{question.user.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className='flex-1'>
          <div className='flex items-center space-x-2 mb-1'>
            <span className='font-medium text-gray-800 dark:text-gray-200'>{question.user.name}</span>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
          <p className='text-gray-700 dark:text-gray-300'>{question.question}</p>

          {/* Question Actions */}
          <div className='flex items-center space-x-4 mt-2 text-sm'>
            <button
              onClick={() => onLikeQuestion(question._id)}
              className={`flex items-center space-x-1 ${question.is_liked ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'} hover:text-orange-500`}
              aria-label={`Thích câu hỏi, ${question.likes_count} lượt thích`}
              aria-pressed={question.is_liked}
            >
              <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20' aria-hidden='true'>
                <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
              </svg>
              <span>{question.likes_count}</span>
            </button>
            <button
              onClick={onToggleReply}
              className='text-gray-500 dark:text-gray-400 hover:text-orange-500'
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
        <div className='mt-4 ml-13 pl-4 border-l-2 border-gray-200 dark:border-slate-600 space-y-3' role='list' aria-label='Danh sách câu trả lời'>
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
                className='w-full p-3 border border-gray-300 dark:border-slate-600 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100'
                rows={2}
                aria-describedby={`${answerTextareaId}-hint`}
              />
              <span id={`${answerTextareaId}-hint`} className='sr-only'>
                Nhập câu trả lời cho câu hỏi này
              </span>
              <div className='flex justify-end space-x-2 mt-2'>
                <button
                  onClick={onToggleReply}
                  className='px-3 py-1 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700'
                  aria-label='Hủy trả lời'
                >
                  Hủy
                </button>
                <button
                  onClick={onSubmitAnswer}
                  disabled={isSubmitting || !answerText.trim()}
                  className='px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label='Gửi câu trả lời'
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
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
      <div className='w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0'>
        {answer.user.avatar ? (
          <img src={answer.user.avatar} alt={answer.user.name} className='w-8 h-8 rounded-full object-cover' />
        ) : (
          <span className='text-xs font-medium text-gray-600 dark:text-gray-300'>{answer.user.name?.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className='flex-1'>
        <div className='flex items-center space-x-2 mb-1'>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-sm'>{answer.user.name}</span>
          {answer.user.is_seller && (
            <span className='px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full font-medium'>
              Người bán
            </span>
          )}
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: vi })}
          </span>
        </div>
        <p className='text-gray-700 dark:text-gray-300 text-sm'>{answer.answer}</p>
        <button
          onClick={() => onLikeAnswer(questionId, answer._id)}
          className={`flex items-center space-x-1 mt-1 text-xs ${answer.is_liked ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'} hover:text-orange-500`}
          aria-label={`Thích câu trả lời, ${answer.likes_count} lượt thích`}
          aria-pressed={answer.is_liked}
        >
          <svg className='w-3 h-3 fill-current' viewBox='0 0 20 20' aria-hidden='true'>
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
    <div className={`bg-white dark:bg-slate-800 p-4 md:p-6 shadow rounded min-h-[400px] ${className}`} aria-label='Đang tải câu hỏi' role='status'>
      <div className='animate-pulse'>
        <div className='h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6'></div>
        <div className='h-24 bg-gray-200 dark:bg-slate-700 rounded mb-6'></div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='border border-gray-200 dark:border-slate-700 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <div className='w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-2'></div>
                  <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2'></div>
                  <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4'></div>
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
    <div className='text-center py-8' role='status'>
      <svg
        className='w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4'
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
      <p className='text-gray-400 dark:text-gray-500 text-sm mt-1'>Hãy là người đầu tiên đặt câu hỏi!</p>
    </div>
  )
})

export default ProductQA

