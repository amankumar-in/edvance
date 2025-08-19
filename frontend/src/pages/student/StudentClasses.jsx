import { Avatar, Card, Flex, Grid, Inset, Text } from '@radix-ui/themes';
import { BookOpenCheck, CalendarX, GraduationCap } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../../Context/AuthContext';
import { useGetStudentClasses } from '../../api/student/student.queries';
import Honors from '../../assets/Honors.webp';
import { EmptyStateCard, ErrorCallout, Loader } from '../../components';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function StudentClasses() {
  const { profiles } = useAuth();
  const studentId = profiles?.['student']?._id;
  const dayToday = days[new Date().getDay()];

  const { data: classes, isLoading: isClassesLoading, isError: isClassesError, error: classesError } = useGetStudentClasses(studentId);
  const classesData = classes?.data ?? [];

  if (isClassesLoading) return (
    <Flex justify='center' align='center' className='h-full'>
      <Loader />
    </Flex>
  )

  if (isClassesError) return (
    <div>
      <ErrorCallout
        className={'mx-auto max-w-2xl'}
        errorMessage={classesError?.response?.data?.message || 'Something went wrong while fetching classes'}
      />
    </div>
  )

  return (
    <div className='space-y-6'>
      <Grid columns={{ initial: '1', xs: '2', md: '3', lg: '4', xl: '5' }} gap="5">
        {classesData.length > 0 ? classesData.map((classData) => {
          const schedule = classData?.schedule.map(schedule => schedule.dayOfWeek.toLowerCase());
          const hasClassToday = schedule.includes(dayToday.toLowerCase());
          return (
            <>
              <Card key={classData._id} size={'2'} className='flex flex-col justify-between shadow-md transition hover:shadow-lg aspect-square' asChild>
                <Link to={`/student/attendance/${classData._id}`}>

                  <div className='space-y-4'>
                    <Inset clip="padding-box" side="top" className='relative'>
                      <img src={Honors} alt=""
                        className='object-cover object-center w-full h-24'
                      />
                      <div className='absolute inset-0 bg-gradient-to-b to-transparent from-black/40' />
                      <div className='absolute top-2 left-2'>
                        <Text as='p' className='text-white line-clamp-1' size='5' weight={'medium'}>{classData?.name ?? 'No name'}</Text>
                        <Text as='p' size='2' className='text-white'>{classData?.grade ?? 'No grade'}</Text>
                      </div>
                    </Inset>
                    <Flex gap='2' align='center'>
                      <Avatar
                        src={classData?.teacher?.avatar}
                        fallback={classData?.teacher?.name?.charAt(0)}
                        size={'4'}
                        className='rounded-full'
                      />
                      <Text as='p' size={'2'}>{classData?.teacher?.name ?? 'No teacher'}</Text>
                    </Flex>
                  </div>

                  <div className='pt-2 border-t border-[--gray-a6]'>
                    <Text as='p' size='1' color='gray' className='flex gap-2 items-center w-full text-right'>
                      {hasClassToday ? (
                        <>
                          <BookOpenCheck size={16} />
                          Class Today
                        </>
                      ) : (
                        <>
                          <CalendarX size={16} />
                          No Class Today
                        </>
                      )}
                    </Text>
                  </div>
                </Link>
              </Card>
            </>
          )
        }
        ) : (
          <EmptyStateCard
            title='No classes found'
            description='You are not enrolled in any classes'
            icon={<GraduationCap />}
          />
        )}
      </Grid>
    </div >

  )
}

export default StudentClasses

