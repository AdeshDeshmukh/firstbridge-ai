'use client'

interface ProfileData {
  firstName: string
  lastName: string
  university: string
  major: string
  year: number
  isFirstGen: boolean
}

interface StepProfileProps {
  data: ProfileData
  onChange: (updates: Partial<ProfileData>) => void
  onNext: () => void
}

export default function StepProfile({ data, onChange, onNext }: StepProfileProps) {
  const years = [
    { label: 'Freshman (Year 1)', value: 1 },
    { label: 'Sophomore (Year 2)', value: 2 },
    { label: 'Junior (Year 3)', value: 3 },
    { label: 'Senior (Year 4)', value: 4 },
    { label: 'Graduate Study (Year 5+)', value: 5 },
  ]

  const isFormValid = data.firstName && data.lastName && data.university && data.major && data.year

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first-name" className="text-xs font-semibold text-gray-750 block mb-1">
            First Name
          </label>
          <input
            id="first-name"
            type="text"
            required
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            placeholder="Maria"
          />
        </div>
        <div>
          <label htmlFor="last-name" className="text-xs font-semibold text-gray-750 block mb-1">
            Last Name
          </label>
          <input
            id="last-name"
            type="text"
            required
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            placeholder="Hernandez"
          />
        </div>
      </div>

      <div>
        <label htmlFor="university" className="text-xs font-semibold text-gray-750 block mb-1">
          University / College
        </label>
        <input
          id="university"
          type="text"
          required
          value={data.university}
          onChange={(e) => onChange({ university: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          placeholder="State University"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="major" className="text-xs font-semibold text-gray-750 block mb-1">
            Major / Study Field
          </label>
          <input
            id="major"
            type="text"
            required
            value={data.major}
            onChange={(e) => onChange({ major: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            placeholder="Mechanical Engineering"
          />
        </div>

        <div>
          <label htmlFor="academic-year" className="text-xs font-semibold text-gray-750 block mb-1">
            Current Year
          </label>
          <select
            id="academic-year"
            value={data.year || ''}
            onChange={(e) => onChange({ year: Number(e.target.value) })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white"
          >
            <option value="" disabled>Select your year</option>
            {years.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <label className="text-xs font-semibold text-gray-755 block mb-2">
          Are you a first-generation college student?
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onChange({ isFirstGen: true })}
            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              data.isFirstGen
                ? 'bg-brand-primary-light border-brand-primary text-brand-primary font-bold shadow-sm'
                : 'border-gray-200 text-gray-650 hover:bg-gray-50'
            }`}
          >
            Yes, I am
          </button>
          <button
            type="button"
            onClick={() => onChange({ isFirstGen: false })}
            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              !data.isFirstGen
                ? 'bg-brand-primary-light border-brand-primary text-brand-primary font-bold shadow-sm'
                : 'border-gray-200 text-gray-650 hover:bg-gray-50'
            }`}
          >
            No, I am not
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          First-generation students are the first in their immediate families to attend or complete college.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
