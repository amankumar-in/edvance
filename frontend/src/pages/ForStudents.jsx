import { Text } from '@radix-ui/themes'
import {
  Badge,
  BookOpen,
  CheckCircle,
  Download,
  Gift,
  GraduationCap,
  Heart,
  Lock,
  Play,
  QrCode,
  Shield,
  Smartphone,
  Star,
  Trophy
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '../utils/helperFunctions'

const ForStudents = () => {
  const { theme, resolvedTheme } = useTheme()
  return (
    <div className="">

      {/* Hero Section with Split Layout */}
      <section className="overflow-hidden relative text-white bg-gradient-to-r from-[--blue-9] to-[--purple-9]">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-12 items-center lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium rounded-full backdrop-blur-sm bg-white/20">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>Powered by Coins for College</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Learning That
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[--yellow-9] to-[--amber-9]">
                  Rewards You!
                </span>
              </h1>
              <p className="text-xl leading-relaxed text-blue-100">
                At Coins for College, we believe your hard work deserves recognition!
                Turn your effort into something amazing—rack up points, hit milestones, and score awesome rewards!
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium text-[--purple-9] bg-white rounded-lg transition-colors hover:bg-gray-100">
                  <Download className="mr-2 w-5 h-5" />
                  Download App Now
                </button>
                <button className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium text-white rounded-lg border-2 transition-colors border-white/30 hover:bg-white/10">
                  <Play className="mr-2 w-5 h-5" />
                  See How It Works
                </button>
              </div>
            </div>

            {/* Children running positioned at bottom of right column */}
            <div className="flex relative justify-center items-end h-64 lg:justify-end lg:h-80">
              <img
                src="/images/children-running-transparent-bg.png"
                alt="Children Running"
                className="object-bottom w-auto h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Points Section */}
      <section className="py-20 bg-[--gray-background]">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Scholarship Points
            </h2>
            <Text as='p' color='gray' className="mx-auto max-w-3xl text-xl">
              Unlike the SAT which is just one test, Scholarship Points tell your complete story—tracking your progress,
              participation, and achievements from Kindergarten through 12th grade.
            </Text>
          </div>

          <div className="p-8 mb-12 bg-[--color-panel] rounded-2xl border border-[--gray-a6]">
            <div className="grid gap-8 items-center md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-bold">Your Full Story Matters</h3>
                <Text as='p' color='gray' className="mb-6">
                  Scholarship Points (SPs) celebrate your hard work in school beyond just grades and test scores.
                  They showcase your dedication and help colleges see the full picture of who you are as a student.
                </Text>
                <div className="space-y-3">
                  <Text as='div' color='green' className="flex items-center">
                    <CheckCircle className="mr-3 w-5 h-5" />
                    <span>Every class you attend earns points</span>
                  </Text>
                  <Text as='div' color='green' className="flex items-center">
                    <CheckCircle className="mr-3 w-5 h-5" />
                    <span>Completing challenges and goals</span>
                  </Text>
                  <Text as='div' color='green' className="flex items-center">
                    <CheckCircle className="mr-3 w-5 h-5" />
                    <span>Participating in activities</span>
                  </Text>
                  <Text as='div' color='green' className="flex items-center">
                    <CheckCircle className="mr-3 w-5 h-5" />
                    <span>Building your college portfolio</span>
                  </Text>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block p-8 mb-4 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-full">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
                <h4 className="mb-2 text-lg font-bold">College Recognition</h4>
                <Text as='p' color='gray'>
                  Colleges get a complete picture of your commitment, helping them consider you for scholarships,
                  grants, and special opportunities.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section
        className={cn(
          "py-20",
          resolvedTheme === "dark" ? "bg-[--gray-a2]" : "bg-[--color-background]"
        )}
      >
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              We Have Something To Love For Everyone!
            </h2>
            <Text as='p' color='gray' className="text-xl">
              Use your points to get amazing rewards and benefits
            </Text>
          </div>

          <div className="grid gap-8 mb-12 md:grid-cols-2">
            {/* Instant Rewards Card */}
            <div className="p-8 text-white bg-gradient-to-br from-[--grass-9] to-[--green-10] rounded-2xl shadow-2xl transition-all duration-300 transform hover:shadow-3xl">
              <div className="flex items-center mb-8">
                <div className="flex justify-center items-center mr-4 w-16 h-16 rounded-xl backdrop-blur-sm bg-white/20">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 text-2xl font-bold">Instant Rewards</h3>
                  <p className="text-sm text-green-100">Available to all students</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 text-center rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="mb-3 text-3xl">🎁</div>
                  <div className="font-medium">Gift Cards</div>
                  <div className="mt-1 text-xs text-green-100">Amazon, iTunes & more</div>
                </div>
                <div className="p-4 text-center rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="mb-3 text-3xl">📚</div>
                  <div className="font-medium">Learning Tools</div>
                  <div className="mt-1 text-xs text-green-100">Study aids & resources</div>
                </div>
                <div className="p-4 text-center rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="mb-3 text-3xl">🎮</div>
                  <div className="font-medium">Games & Apps</div>
                  <div className="mt-1 text-xs text-green-100">Educational & fun</div>
                </div>
                <div className="p-4 text-center rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="mb-3 text-3xl">🏪</div>
                  <div className="font-medium">Local Discounts</div>
                  <div className="mt-1 text-xs text-green-100">Restaurants & stores</div>
                </div>
              </div>
            </div>

            {/* Premium Rewards Card */}
            <div className="p-8 text-white bg-gradient-to-br from-[--purple-9] to-[--pink-9] rounded-2xl shadow-2xl transition-all duration-300 transform hover:shadow-3xl">
              <div className="flex items-center mb-8">
                <div className="flex justify-center items-center mr-4 w-16 h-16 rounded-xl backdrop-blur-sm bg-white/20">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 text-2xl font-bold">Premium Rewards</h3>
                  <p className="text-sm text-purple-100">For partnered schools</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="flex items-center mb-2">
                    <Star className="mr-2 w-5 h-5 text-yellow-300" />
                    <div className="font-semibold">Enhanced Prizes</div>
                  </div>
                  <div className="text-sm text-purple-100">Special incentives tailored to your school</div>
                </div>
                <div className="p-5 rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="flex items-center mb-2">
                    <Lock className="mr-2 w-5 h-5 text-yellow-300" />
                    <div className="font-semibold">Exclusive Access</div>
                  </div>
                  <div className="text-sm text-purple-100">Unique rewards from school partners</div>
                </div>
                <div className="p-5 rounded-xl backdrop-blur-sm transition-colors bg-white/20 hover:bg-white/30">
                  <div className="flex items-center mb-2">
                    <Gift className="mr-2 w-5 h-5 text-yellow-300" />
                    <div className="font-semibold">Surprise Rewards</div>
                  </div>
                  <div className="text-sm text-purple-100">From our amazing sponsors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20 bg-[--gray-background]'>
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Learn, Grow, and Earn
            </h2>
            <Text as='p' color='gray' className="text-xl">
              Participate in meaningful activities designed for your grade level and interests
            </Text>
          </div>

          <div className="grid gap-8 mb-12 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-xl font-bold text-white bg-gradient-to-r from-[--purple-9] to-[--pink-9] rounded-full">
                1
              </div>
              <h3 className="mb-2 text-lg font-bold">Complete Tasks</h3>
              <Text as='p' color='gray'>Finish lessons on Khan Academy and Duolingo, engage in wellness programs, or help out at home with life skills.</Text>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-xl font-bold text-white bg-gradient-to-r from-[--purple-9] to-[--pink-9] rounded-full">
                2
              </div>
              <h3 className="mb-2 text-lg font-bold">Earn Points</h3>
              <Text as='p' color='gray'>Every completed task, class attendance, and extracurricular activity earns you Scholarship Points.</Text>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-xl font-bold text-white bg-gradient-to-r from-[--purple-9] to-[--pink-9] rounded-full">
                3
              </div>
              <h3 className="mb-2 text-lg font-bold">Claim Rewards</h3>
              <Text as='p' color='gray'>Use your points for gift cards, learning tools, discounts, or save up for scholarships!</Text>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
              <div className="flex items-start space-x-4">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Academic Activities</h3>
                  <Text color='blue' className="mb-2 text-sm font-medium">Designed for Your Grade</Text>
                  <Text as='p' color='gray' className="leading-relaxed">Complete lessons on platforms like Khan Academy and Duolingo. Engage in subjects like math, science, and programming challenges that develop your skills.</Text>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
              <div className="flex items-start space-x-4">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Wellness & Life Skills</h3>
                  <Text color='blue' className="mb-2 text-sm font-medium">Build Character</Text>
                  <Text as='p' color='gray' className="leading-relaxed">Participate in mental health programs, help out at home with responsibilities, and take part in community service and extracurricular activities.</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
      className={cn(
          "py-20",
          resolvedTheme === "dark" ? "bg-[--gray-a2]" : "bg-[--color-background]"
        )}
      >
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="grid gap-12 items-center mb-16 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Track Your Progress
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold">See How Far You've Come</h3>
                      <Text as='p' color='gray' className="leading-relaxed">Easily monitor your points, completed tasks, and unlocked rewards in the app to stay on top of your achievements.</Text>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                      <Badge className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold">Earn Badges</h3>
                      <Text as='p' color='gray' className="leading-relaxed">Hit milestones and collect digital badges to celebrate your progress and showcase your dedication!</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <img src="/images/app-rewards-cards.png" alt="Rewards Cards" className="mx-auto w-full max-w-md" />
            </div>
          </div>

          <div className="grid gap-12 items-center md:grid-cols-2">
            <div className="order-2 text-center md:order-1">
              <img src="/images/blockchain-1.png" alt="DocuLocker" className="mx-auto w-full max-w-md" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Keep Your School Stuff Safe
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold">Your Digital Locker</h3>
                      <Text as='p' color='gray' className="leading-relaxed">With DocuLocker – Powered by Coins for College, you can securely store your report cards, attendance records, and other important school documents all in one place.</Text>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6] transition-colors hover:border-[--focus-8]">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-[--blue-9] to-[--purple-9] rounded-lg">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold">Quick and Easy Verification</h3>
                      <Text as='p' color='gray' className="leading-relaxed">Each stored document includes a QR code for instant verification, ensuring that your records are always accessible and protected.</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className='py-20 bg-[--color-background]'
      >
        <div className="px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-r from-[--grass-9] to-[--green-10] rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              You Are Protected
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6]">
              <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 rounded-lg bg-[--green-a3]">
                <Lock className="w-6 h-6 text-[--green-a11]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Your Privacy Matters</h3>
              <Text as='p' color='gray'>
                We prioritize your safety by ensuring that no personal contact information,
                such as phone numbers or emails, is collected.
              </Text>
            </div>

            <div className="p-6 bg-[--color-panel] rounded-lg border border-[--gray-a6]">
              <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 rounded-lg bg-[--blue-a3]">
                <GraduationCap className="w-6 h-6 text-[--blue-a11]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Made Just for Students</h3>
              <Text as='p' color='gray'>
                Our app is designed specifically for students—no distractions, no ads,
                just a fun and engaging way to learn and earn rewards.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white bg-gradient-to-r from-[--blue-9] to-[--purple-9]">
        <div className="px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Start Earning Rewards Today!
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Make learning more exciting with Rewards for Education. Start earning points
            and unlocking amazing prizes for your achievements TODAY!
          </p>
          <button className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium text-[--purple-9] bg-white rounded-lg transition-colors hover:bg-gray-100">
            <Smartphone className="mr-2 w-5 h-5" />
            Download App - iOS & Android
          </button>
        </div>
      </section>

    </div>
  )
}

export default ForStudents