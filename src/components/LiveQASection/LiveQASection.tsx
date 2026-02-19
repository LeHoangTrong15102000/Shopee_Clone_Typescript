import classNames from 'classnames'

interface LiveQAAnswer {
  question_id: string
  answer: {
    user_name: string
    answer: string
    is_seller: boolean
  }
}

interface LiveQASectionProps {
  newQuestionCount: number
  newAnswers: LiveQAAnswer[]
  onViewQuestions?: () => void
  className?: string
}

export default function LiveQASection({ newQuestionCount, newAnswers, onViewQuestions, className }: LiveQASectionProps) {
  if (newQuestionCount <= 0 && newAnswers.length === 0) {
    return null
  }

  return (
    <div className={classNames('rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm animate-fade-in', className)}>
      {newQuestionCount > 0 && (
        <div
          className='flex items-center gap-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded px-2 py-1 transition-colors'
          onClick={onViewQuestions}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewQuestions?.()}
        >
          <span className='text-lg'>❓</span>
          <span className='text-blue-600 dark:text-blue-400 font-medium'>{newQuestionCount} câu hỏi mới</span>
          <span className='text-gray-400 dark:text-gray-500 text-xs ml-auto'>Nhấn để xem ↓</span>
        </div>
      )}
      {newAnswers.length > 0 && (
        <div className='mt-2 space-y-1'>
          {newAnswers.slice(-3).map((item, index) => (
            <div
              key={`${item.question_id}-${index}`}
              className={classNames(
                'flex items-start gap-2 rounded px-2 py-1 text-xs',
                { 'bg-[#fff5f0] dark:bg-orange-900/20 border-l-2 border-[#ee4d2d]': item.answer.is_seller, 'bg-white dark:bg-slate-700': !item.answer.is_seller }
              )}
            >
              <span>{item.answer.is_seller ? '🏪' : '💬'}</span>
              <div>
                <span className={classNames('font-medium', { 'text-[#ee4d2d]': item.answer.is_seller, 'text-gray-700 dark:text-gray-200': !item.answer.is_seller })}>
                  {item.answer.user_name}
                  {item.answer.is_seller && ' (Người bán)'}
                </span>
                <p className='text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2'>{item.answer.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

