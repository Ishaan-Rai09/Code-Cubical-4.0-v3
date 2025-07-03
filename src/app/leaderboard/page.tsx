'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy,
  Star,
  Award,
  Users,
  TrendingUp,
  ArrowLeft,
  Eye,
  Medal,
  Crown,
  Target
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Doctor {
  _id: string
  doctorName: string
  doctorSpecialization: string
  averageRating: number
  totalReviews: number
  rank: number
  recentReviews: Array<{
    rating: number
    comment: string
    patientEmail: string
    createdAt: string
  }>
}

interface LeaderboardData {
  leaderboard: Doctor[]
  specializations: string[]
  currentFilter: string
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all')

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaderboard/doctors?specialization=${filterSpecialization}&limit=20`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          toast.error('Failed to load leaderboard data')
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        toast.error('Failed to load leaderboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [filterSpecialization])

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSpecialization(e.target.value)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const doctors = data?.leaderboard || []
  const specializations = data?.specializations || []

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700 hover:text-blue-600 transition-colors">Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Leaderboard</h1>
            <div className="flex space-x-4">
              <Link href="/doctor-login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Doctor Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Top Rated Doctors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our highest-rated medical professionals who provide exceptional AI-assisted diagnosis and analysis
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{doctors.length}</div>
            <div className="text-gray-600">Active Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {doctors.length > 0 ? (doctors.reduce((sum, d) => sum + d.averageRating, 0) / doctors.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {doctors.reduce((sum, d) => sum + d.totalReviews, 0)}
            </div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{specializations.length}</div>
            <div className="text-gray-600">Specializations</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 className="text-xl font-bold text-gray-800">Rankings</h2>
            <div className="flex space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'cases')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="cases">Sort by Cases</option>
              </select>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {filteredAndSortedDoctors.map((doctor, index) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Rank */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankBadgeColor(doctor.rank)}`}>
                    {getRankIcon(doctor.rank)}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                      {doctor.verifiedDoctor && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(doctor.averageRating)}
                        </div>
                        <span className="font-medium">{doctor.averageRating}</span>
                        <span>({doctor.totalReviews} reviews)</span>
                      </div>
                      <span>•</span>
                      <span>{doctor.totalCases} cases</span>
                      <span>•</span>
                      <span>Avg response: {doctor.responseTime}</span>
                    </div>
                    
                    {/* Achievements */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {doctor.achievements.map((achievement, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="flex flex-col items-end space-y-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">Rank #{doctor.rank}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedDoctors.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Doctors Found</h3>
            <p className="text-gray-600">No doctors match your current filters.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Are you a medical professional?</h2>
          <p className="text-blue-100 mb-6">Join our platform and help patients get the best AI-assisted medical analysis</p>
          <Link href="/doctor-login">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Join as a Doctor
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
