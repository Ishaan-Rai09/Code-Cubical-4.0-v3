'use client'

import { useState, useEffect } from 'react'
import { 
  Star,
  MessageSquare,
  User,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  ThumbsUp,
  Brain,
  Heart,
  Wind,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
  id: string
  patientName: string
  rating: number
  comment: string
  scanType: 'Brain MRI' | 'Cardiac Scan' | 'Lung CT' | 'Liver Scan'
  date: Date
  verified: boolean
}

// Mock review data
const mockReviews: Review[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    rating: 5,
    comment: 'Dr. was incredibly thorough and explained everything clearly. The analysis was spot-on and helped catch an issue early. Highly recommend!',
    scanType: 'Brain MRI',
    date: new Date('2024-07-01T14:30:00'),
    verified: true
  },
  {
    id: '2',
    patientName: 'Michael Brown',
    rating: 5,
    comment: 'Excellent service! Quick turnaround time and very detailed report. The doctor took time to answer all my questions.',
    scanType: 'Cardiac Scan',
    date: new Date('2024-06-28T10:15:00'),
    verified: true
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    rating: 4,
    comment: 'Good analysis and professional service. Report was comprehensive and easy to understand.',
    scanType: 'Lung CT',
    date: new Date('2024-06-25T16:45:00'),
    verified: true
  },
  {
    id: '4',
    patientName: 'David Wilson',
    rating: 5,
    comment: 'Outstanding expertise! The doctor identified something that was missed in previous scans. Very grateful for the detailed attention.',
    scanType: 'Liver Scan',
    date: new Date('2024-06-22T09:20:00'),
    verified: true
  },
  {
    id: '5',
    patientName: 'Lisa Anderson',
    rating: 5,
    comment: 'Professional, timely, and accurate. The peace of mind from getting a thorough review was invaluable.',
    scanType: 'Brain MRI',
    date: new Date('2024-06-20T13:10:00'),
    verified: true
  },
  {
    id: '6',
    patientName: 'Robert Miller',
    rating: 4,
    comment: 'Very satisfied with the service. Clear communication and detailed findings.',
    scanType: 'Cardiac Scan',
    date: new Date('2024-06-18T11:30:00'),
    verified: true
  },
  {
    id: '7',
    patientName: 'Jennifer Garcia',
    rating: 5,
    comment: 'Exceptional analysis! The doctor went above and beyond in explaining the results and recommendations.',
    scanType: 'Lung CT',
    date: new Date('2024-06-15T15:20:00'),
    verified: true
  },
  {
    id: '8',
    patientName: 'Thomas Lee',
    rating: 5,
    comment: 'Top-notch medical expertise. Caught an early-stage issue that I can now address proactively.',
    scanType: 'Liver Scan',
    date: new Date('2024-06-12T08:45:00'),
    verified: true
  }
]

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [filterScanType, setFilterScanType] = useState<string>('all')

  // Calculate statistics
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const totalReviews = reviews.length
  const fiveStarCount = reviews.filter(r => r.rating === 5).length
  const fourStarCount = reviews.filter(r => r.rating === 4).length
  const threeStarCount = reviews.filter(r => r.rating === 3).length
  const twoStarCount = reviews.filter(r => r.rating === 2).length
  const oneStarCount = reviews.filter(r => r.rating === 1).length

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const ratingMatch = filterRating === 'all' || review.rating === filterRating
    const scanTypeMatch = filterScanType === 'all' || review.scanType === filterScanType
    return ratingMatch && scanTypeMatch
  })

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingBarWidth = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  const getMRIIcon = (type: string) => {
    switch (type) {
      case 'Brain MRI': return Brain
      case 'Cardiac Scan': return Heart
      case 'Lung CT': return Wind
      case 'Liver Scan': return Activity
      default: return Activity
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Reviews</h1>
        <p className="text-gray-600">See what patients are saying about your medical analysis work.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(averageRating), 'w-5 h-5')}
          </div>
          <div className="text-gray-600">Overall Rating</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalReviews}</div>
          <div className="text-gray-600">Total Reviews</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{((fiveStarCount / totalReviews) * 100).toFixed(0)}%</div>
          <div className="text-gray-600">5-Star Reviews</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
          <div className="text-gray-600">Verified Reviews</div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Rating Distribution</h2>
        <div className="space-y-3">
          {[
            { stars: 5, count: fiveStarCount },
            { stars: 4, count: fourStarCount },
            { stars: 3, count: threeStarCount },
            { stars: 2, count: twoStarCount },
            { stars: 1, count: oneStarCount }
          ].map(({ stars, count }) => (
            <div key={stars} className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium">{stars}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getRatingBarWidth(count)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Reviews List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl font-bold text-gray-800">All Reviews ({filteredReviews.length})</h2>
          
          <div className="flex space-x-4">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            
            <select
              value={filterScanType}
              onChange={(e) => setFilterScanType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Scan Types</option>
              <option value="Brain MRI">Brain MRI</option>
              <option value="Cardiac Scan">Cardiac Scan</option>
              <option value="Lung CT">Lung CT</option>
              <option value="Liver Scan">Liver Scan</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredReviews.map((review) => {
            const MRIIcon = getMRIIcon(review.scanType)
            return (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{review.patientName}</h3>
                        {review.verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MRIIcon className="h-4 w-4" />
                        <span>{review.scanType}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{review.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed ml-16">{review.comment}</p>
              </div>
            )
          })}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reviews match your current filters.</p>
          </div>
        )}
      </div>

      {/* Recent Highlights */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Review Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Award className="h-8 w-8 mx-auto mb-2" />
            <div className="text-lg font-semibold">Top Rated Doctor</div>
            <div className="text-blue-100 text-sm">This month</div>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <div className="text-lg font-semibold">Rating Improved</div>
            <div className="text-blue-100 text-sm">+0.3 from last month</div>
          </div>
          <div className="text-center">
            <ThumbsUp className="h-8 w-8 mx-auto mb-2" />
            <div className="text-lg font-semibold">100% Positive</div>
            <div className="text-blue-100 text-sm">Last 30 reviews</div>
          </div>
        </div>
      </div>
    </div>
  )
}
