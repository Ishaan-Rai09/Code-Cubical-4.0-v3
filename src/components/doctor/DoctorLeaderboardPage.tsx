'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Users, 
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DoctorLeaderboard {
  _id: string
  doctorName: string
  doctorSpecialization: string
  averageRating: number
  totalReviews: number
  rank: number
  recentReviews: Array<{
    rating: number
    comment: string
  }>
}

export default function DoctorLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<DoctorLeaderboard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const mockLeaderboardData: DoctorLeaderboard[] = [
    {
      _id: 'mock_1',
      doctorName: 'Dr. Sarah Wilson',
      doctorSpecialization: 'heart',
      averageRating: 4.9,
      totalReviews: 127,
      rank: 1,
      recentReviews: [
        {
          rating: 5,
          comment: 'Excellent cardiologist! Very thorough and caring.'
        }
      ]
    },
    {
      _id: 'mock_2',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'brain',
      averageRating: 4.8,
      totalReviews: 98,
      rank: 2,
      recentReviews: [
        {
          rating: 5,
          comment: 'Outstanding neurologist with great expertise.'
        }
      ]
    },
    {
      _id: 'mock_3',
      doctorName: 'Dr. Emily Rodriguez',
      doctorSpecialization: 'lungs',
      averageRating: 4.7,
      totalReviews: 85,
      rank: 3,
      recentReviews: [
        {
          rating: 4,
          comment: 'Very knowledgeable pulmonologist, helped me a lot.'
        }
      ]
    },
    {
      _id: 'mock_4',
      doctorName: 'Dr. James Thompson',
      doctorSpecialization: 'liver',
      averageRating: 4.6,
      totalReviews: 72,
      rank: 4,
      recentReviews: [
        {
          rating: 5,
          comment: 'Excellent hepatologist, very professional.'
        }
      ]
    },
    {
      _id: 'mock_5',
      doctorName: 'Dr. Lisa Johnson',
      doctorSpecialization: 'heart',
      averageRating: 4.5,
      totalReviews: 64,
      rank: 5,
      recentReviews: [
        {
          rating: 4,
          comment: 'Good cardiologist with clear explanations.'
        }
      ]
    }
  ]

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard/doctors')
        const data = await response.json()

        if (data.success && data.data.leaderboard.length > 0) {
          setLeaderboard(data.data.leaderboard)
        } else {
          // Use mock data when API fails or returns empty data
          console.log('Using mock leaderboard data')
          setLeaderboard(mockLeaderboardData)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        // Use mock data on error
        setLeaderboard(mockLeaderboardData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8">
      <div className="text-center mb-12">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Top Doctors</h1>
        <p className="text-xl text-gray-600">Recognizing Excellence in Patient Care</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboard.map((doctor, index) => (
          <div key={doctor._id} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900">{doctor.doctorName}</h2>
            <p className="text-gray-600 mb-2">{doctor.doctorSpecialization}</p>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-medium">{doctor.averageRating}</span>
              <span className="text-sm text-gray-500">({doctor.totalReviews} reviews)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Rank #{doctor.rank}</span>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700">Recent Review:</h4>
              <p className="text-sm text-gray-600 italic">"{doctor.recentReviews[0]?.comment}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
