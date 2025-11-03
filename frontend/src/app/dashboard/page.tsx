'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}>
          PBX.BIZ.ID DASHBOARD
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4" style={{fontFamily: 'Courier New, monospace'}}>
              BILLING SUMMARY
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
          
          <div className="bg-white border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4" style={{fontFamily: 'Courier New, monospace'}}>
              ACTIVE CALLS
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
          
          <div className="bg-white border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4" style={{fontFamily: 'Courier New, monospace'}}>
              CALL HISTORY
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}