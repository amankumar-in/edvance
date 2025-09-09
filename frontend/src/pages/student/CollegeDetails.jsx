import { Badge, Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { ArrowLeft, ExternalLink, Globe, GraduationCap, Mail, MapPin, Phone, Star } from 'lucide-react'
import React from 'react'
import { Link, useParams } from 'react-router'
import { useGetCollegeById } from '../../api/college/college.queries'
import ErrorCallout from '../../components/ErrorCallout'
import Loader from '../../components/Loader'
import { FALLBACK_IMAGES } from '../../utils/constants'
import HighlightsSection from './components/CollegeHightlights'

function CollegeDetails() {
  const { id } = useParams()
  const { data, isLoading, error, isError } = useGetCollegeById(id)
  const college = data?.data

  if (isLoading) {
    return (
      <Flex>
        <Loader className='mx-auto' />
      </Flex>
    )
  }

  if (isError) {
    return (
      <ErrorCallout
        errorMessage={error?.response?.data?.message || 'Something went wrong while fetching college details'}
      />
    )
  }

  if (!college) {
    return null
  }

  return (
    <Box className="mx-auto space-y-6 max-w-6xl">
      <Button asChild variant="ghost" color="gray" highContrast>
        <Link to="/student/colleges">
          <ArrowLeft size={16} />
          Back to Colleges
        </Link>
      </Button>
      {/* Hero Section */}
      <div className="overflow-hidden space-y-6">
        {/* College Header Info */}
        <Box className="space-y-2">
          <Flex align="start" gap="4">
            {/* College Logo */}
            <Box className="flex-shrink-0">
              {college.logo ? (
                <img
                  src={college.logo}
                  alt={`${college.name} logo`}
                  className="object-cover w-20 h-20 rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGES.image
                  }}
                />
              ) : (
                <Box className="flex justify-center items-center w-20 h-20 bg-[--cyan-a3] rounded-full">
                  <GraduationCap size={32} />
                </Box>
              )}
            </Box>

            {/* College Info */}
            <Box className="flex-1">
              <Heading size={{ initial: '6', md: '8' }} className="mb-2">
                {college.name}
              </Heading>

              {college.location && (
                <Flex align="center" gap="2" className="mb-3">
                  <MapPin size={16} className="text-gray-500" />
                  <Text size="3" color="gray">{college.location}</Text>
                </Flex>
              )}
            </Box>
          </Flex>
          {college.shortDescription && (
            <Text as='p' size="3">
              {college.shortDescription}
            </Text>
          )}
        </Box>

        {/* Banner Image */}
        {college.bannerImage && (
          <Box className="relative overflow-hidden w-full aspect-[3/1]">
            {/* Background image */}
            <div
              className="absolute inset-0 z-0 blur-sm"
              style={{
                backgroundImage: `url(${college.bannerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay on background */}
              <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Foreground Image (clear) */}
            <img
              src={college.bannerImage || FALLBACK_IMAGES.image}
              alt={`${college.name} banner`}
              className="object-contain relative z-10 w-full h-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGES.image
              }}
            />

            {/* Featured Badge */}
            {college.isFeatured && (
              <Badge
                color="gold"
                variant="solid"
                className="flex absolute top-4 right-4 z-20 gap-1 items-center"
              >
                <Star size={12} fill="currentColor" />
                Featured College
              </Badge>
            )}
          </Box>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <Box className="space-y-6 lg:col-span-2">
          {/* About Section */}
          {college.description && (
            <Card size={{ initial: '2', xs: '3' }} className='space-y-4 card_no_border'>
              <Heading size="5">
                About {college.name}
              </Heading>
              <Text as='p' size="3" className="whitespace-pre-wrap">
                {college.description}
              </Text>
            </Card>
          )}

          {/* Programs & Courses */}
          {college.courses && college.courses.length > 0 && (
            <Card size={{ initial: '2', xs: '3' }} className='space-y-4 card_no_border'>
              <Heading size="5">
                Programs & Courses
              </Heading>
              <Text as='p' size="2" color="gray">
                Explore the academic programs offered at {college.name}
              </Text>
              <Flex gap="2" wrap="wrap">
                {college.courses.map((course, index) => (
                  <Badge key={index} variant="surface" size="3">
                    {course}
                  </Badge>
                ))}
              </Flex>
            </Card>
          )}
        </Box>

        {/* Right Column - Sidebar */}
        <Box className="space-y-6">
          {/* Contact Information */}
          {college.contactEmail || college.contactPhone || college.website ? <Card size={{ initial: '2', xs: '3' }} className='space-y-4 card_no_border'>
            <Heading size="4" className="mb-4">
              Contact Information
            </Heading>
            <div className="space-y-3">
              {college.location && (
                <Flex align="start" gap="3">
                  <MapPin size={16} className="flex-shrink-0 mt-1 text-gray-500" />
                  <Box>
                    <Text size="2" weight="medium" className="block">
                      Location
                    </Text>
                    <Text size="2" color="gray">
                      {college.location}
                    </Text>
                  </Box>
                </Flex>
              )}

              {college.contactEmail && (
                <Flex align="start" gap="3">
                  <Mail size={16} className="flex-shrink-0 mt-1 text-gray-500" />
                  <Box>
                    <Text size="2" weight="medium" className="block">
                      Email
                    </Text>
                    <Text size="2" color="blue" asChild>
                      <a href={`mailto:${college.contactEmail}`} className="hover:underline">
                        {college.contactEmail}
                      </a>
                    </Text>
                  </Box>
                </Flex>
              )}

              {college.contactPhone && (
                <Flex align="start" gap="3">
                  <Phone size={16} className="flex-shrink-0 mt-1 text-gray-500" />
                  <Box>
                    <Text size="2" weight="medium" className="block">
                      Phone
                    </Text>
                    <Text size="2" color="blue" asChild>
                      <a href={`tel:${college.contactPhone}`} className="hover:underline">
                        {college.contactPhone}
                      </a>
                    </Text>
                  </Box>
                </Flex>
              )}

              {college.website && (
                <Flex align="start" gap="3">
                  <Globe size={16} className="flex-shrink-0 mt-1 text-gray-500" />
                  <Box>
                    <Text size="2" weight="medium" className="block">
                      Website
                    </Text>
                    <Text size="2" color="blue" asChild>
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-1 items-center hover:underline"
                      >
                        Visit Website
                        <ExternalLink size={12} />
                      </a>
                    </Text>
                  </Box>
                </Flex>
              )}
            </div>
          </Card> : null}

          {/* Quick Stats */}
          {college.courses && college.courses.length > 0 && <Card size={{ initial: '2', xs: '3' }} className='space-y-4 card_no_border'>
            <Heading size="4" className="mb-4">
              Quick Facts
            </Heading>
            <div className="space-y-3">
              {college.tier && (
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Tier</Text>
                  <Badge
                    variant="soft"
                    color={
                      college.tier === 'Ivy League' ? 'purple' :
                        college.tier === 'tier1' ? 'blue' :
                          college.tier === 'tier2' ? 'green' : 'gray'
                    }
                  >
                    {college.tier === 'Ivy League' ? 'Ivy League' :
                      college.tier === 'tier1' ? 'Tier 1' :
                        college.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                  </Badge>
                </Flex>
              )}

              <Flex justify="between" align="center">
                <Text size="2" color="gray">Status</Text>
                <Badge variant="soft" color={college.status === 'published' ? 'green' : 'orange'}>
                  {college.status === 'published' ? 'Active' : 'Draft'}
                </Badge>
              </Flex>

              {college.isFeatured && (
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Recognition</Text>
                  <Badge color="gold" variant="soft">
                    <Star size={12} fill="currentColor" />
                    Featured
                  </Badge>
                </Flex>
              )}

              {college.courses && college.courses.length > 0 && (
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Programs</Text>
                  <Text size="2" weight="medium">
                    {college.courses.length} Available
                  </Text>
                </Flex>
              )}
            </div>
          </Card>}

          {/* Apply Now CTA */}
          {(college.website || college.contactEmail) && <Card size={{ initial: '2', xs: '3' }} className='space-y-4 card_no_border'>
            <Heading size="4">
              Interested in {college.name}?
            </Heading>
            <Text as="p" size="2" color="gray">
              Take the next step in your educational journey
            </Text>
            <div className="space-y-3">
              {college.website && (
                <Button className="w-full" asChild size="3">
                  <a href={college.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={18} />
                    Visit College Website
                  </a>
                </Button>
              )}
              {college.contactEmail && (
                <Button variant="outline" className="w-full" asChild size="3">
                  <a href={`mailto:${college.contactEmail}`}>
                    <Mail size={18} />
                    Contact Admissions
                  </a>
                </Button>
              )}
            </div>
          </Card>}
        </Box>
      </div>


      {/* Highlights Section */}
      <HighlightsSection college={college} />
    </Box>
  )
}

export default CollegeDetails
