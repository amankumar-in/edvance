import { Avatar, Box, Button, Callout, Card, Flex, Grid, Heading, IconButton, Separator, Text } from '@radix-ui/themes'
import { AlertCircle, CalendarDays, Check, Clock, Copy, Edit, Mail, Phone, Trash, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useDeleteClass } from '../../../api/school-class/schoolClass.mutations'
import { useClassDetails } from '../../../api/school-class/schoolClass.queries'
import Honors from '../../../assets/Honors.webp'
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../../components'
import AssignTeacherDialog from '../components/AssignTeacherDialog'
import CreateClassDialog from '../components/CreateClassDialog'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayToday = daysOfWeek[new Date().getDay()].toLowerCase();

function Overview() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useClassDetails(classId);
  const classDetails = data?.data ?? {};
  const schedule = classDetails?.schedule ?? [];
  const teacherDetails = classDetails?.teacherId?.userId ?? {};

  // Open assign teacher dialog if 'assignTeacher=true' query param is present
  // Automatically removes the query param after opening to clean up URL
  useEffect(() => {
    if (searchParams.get('assignTeacher') === 'true') {
      setIsAssignTeacherDialogOpen(true);
      // Clean up URL
      searchParams.delete('assignTeacher');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // sortedSchedule will be ordered Monday -> Sunday
  const sortedSchedule = schedule.sort((a, b) => {
    return daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek);
  });

  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const deleteClassMutation = useDeleteClass();

  const handleRemoveConfirm = () => {
    if (classId) {
      deleteClassMutation.mutate(classId, {
        onSuccess: () => {
          setIsRemoveDialogOpen(false);
          navigate('/school-admin/classes');
        }
      });
    }
  };

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyJoinCode = (joinCode) => {
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopiedCode(true);
      toast.success('Join code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy join code');
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='space-y-6'>
        <Callout.Root color='red' variant='surface'>
          <Callout.Icon>
            <AlertCircle size={16} />
          </Callout.Icon>
          <Callout.Text>
            Failed to load class details. Please try again.
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-5xl">

      <div className='flex relative flex-col gap-2 justify-end p-4 h-40 rounded-xl shadow-md sm:h-60'
        style={{
          backgroundImage: `url(${Honors})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Flex
          className='absolute top-4 right-4'
          gap='2'
          align='center'
        >
          <Button className='shadow-md'
            onClick={() => setIsEditClassDialogOpen(true)}
          >
            <Edit size={16} /> Edit
          </Button>
          <Button
            color='red'
            className='shadow-md'
            onClick={() => setIsRemoveDialogOpen(true)}
          >
            <Trash size={16} /> Delete
          </Button>
        </Flex>
        <Text as='p' size={{ initial: '6', xs: '7' }} weight='bold' className='text-[--accent-contrast] '>
          {classDetails?.name}
        </Text>
        <Text as='p' size='4' className='text-[--accent-contrast]'>
          {classDetails?.grade}
        </Text>
      </div>

      <Grid columns={{ initial: '1', md: '2' }} className='gap-6'>
        {/* Class Information */}
        <Card size={{ initial: '2', sm: '3' }} className='shadow-md'>
          <Flex direction="column" gap="4">
            <Heading size="4">Class Information</Heading>
            <Separator size='4' />
            <div className="space-y-4">
              <Flex justify="between" align="center">
                <Text as='p' color="gray" size="2">Class Name</Text>
                <Text as='p'>{classDetails?.name}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text as='p' color="gray" size="2">Grade</Text>
                <Text as='p'>{classDetails?.grade}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text color="gray" size="2">Join Code</Text>
                <Flex align="center" gap="2">
                  <Text as='p' weight="bold" color='blue' className="font-mono">{classDetails?.joinCode}</Text>
                  <IconButton
                    title='Copy join code'
                    aria-label='Copy join code'
                    size="2"
                    variant="ghost"
                    color={copiedCode ? "green" : "blue"}
                    onClick={() => handleCopyJoinCode(classDetails?.joinCode)}
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  </IconButton>
                </Flex>
              </Flex>
              <Flex justify="between" align="center">
                <Text as='p' color="gray" size="2">Academic Year</Text>
                <Text as='p'>{classDetails?.academicYear}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text as='p' color="gray" size="2">Term</Text>
                <Text as='p'>{classDetails?.academicTerm || '-'}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text as='p' color="gray" size="2">Total Students</Text>
                <Text as='p'>{classDetails?.studentIds?.length || 0}</Text>
              </Flex>
            </div>
          </Flex>
        </Card>

        {/* Teacher Information */}
        <Card size={{ initial: '2', sm: '3' }} className='shadow-md'>
          <Flex direction="column" gap="4">
            <Heading size="4">Teacher</Heading>
            <Separator size='4' />
            {teacherDetails?.email ? (
              <Flex direction="column" gap="4">
                <Flex align="center" gap="3">
                  <Avatar
                    size="5"
                    radius='full'
                    src={teacherDetails?.avatar}
                    fallback={`${teacherDetails?.firstName[0]}`}
                  />
                  <Box>
                    <Text as='p' weight="medium" size="3">
                      {teacherDetails?.firstName} {teacherDetails?.lastName}
                    </Text>
                  </Box>
                </Flex>
                <div className="space-y-3">
                  <Flex align="center" gap="2">
                    <Mail size={14} color="var(--gray-11)" />
                    <Text size="2">{teacherDetails?.email || '-'}</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Phone size={14} color="var(--gray-11)" />
                    <Text size="2">{teacherDetails?.phoneNumber || '-'}</Text>
                  </Flex>
                </div>
              </Flex>
            ) : (
              <EmptyStateCard
                title='No teacher assigned'
                description='No teacher assigned to this class'
                icon={<User />}
                action={(
                  <AssignTeacherDialog
                    open={isAssignTeacherDialogOpen}
                    onOpenChange={setIsAssignTeacherDialogOpen}
                    classDetails={classDetails}
                  >
                    <Button onClick={() => setIsAssignTeacherDialogOpen(true)}>
                      Assign Teacher
                    </Button>
                  </AssignTeacherDialog>
                )}
              />
            )}
          </Flex>
        </Card>
      </Grid>

      {/* Schedule */}
      <Card size={{ initial: '2', sm: '3' }} className='shadow-md'>
        <Flex direction="column" gap="4">
          <Heading size="4">Class Schedule</Heading>
          <Separator size='4' />
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
            {sortedSchedule.length > 0 ? (
              sortedSchedule.map((details) => (
                <Card key={details._id} variant="soft" size="2" className={`transition-all shadow-md hover:-translate-y-1 ${details.dayOfWeek.toLowerCase() === dayToday ? 'bg-[--accent-a2] border border-[--accent-9]' : ''}  ${details.dayOfWeek.toLowerCase() === 'saturday' || details.dayOfWeek.toLowerCase() === 'sunday' ? 'opacity-50' : ''}`} >
                  <Flex direction="column" gap="2">
                    <Text weight="medium" size="3">{details.dayOfWeek}</Text>
                    <Flex align="center" gap="2">
                      <Clock size={14} color="var(--gray-11)" />
                      <Text size="2" color="gray">
                        {details.startTime} - {details.endTime}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              ))
            ) : (
              <div className='col-span-full'>
                <EmptyStateCard
                  title='No schedule found'
                  description='No schedule found for this class'
                  icon={<CalendarDays />}
                />
              </div>

            )}
          </Grid>
        </Flex>
      </Card>

      <CreateClassDialog
        open={isEditClassDialogOpen}
        onOpenChange={setIsEditClassDialogOpen}
        isEdit={true}
        selectedClass={classDetails}
      />


      <ConfirmationDialog
        title='Delete Class'
        description={
          classDetails
            ? `Are you sure you want to delete ${classDetails.name} class?`
            : 'Are you sure you want to delete this class?'
        }
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        onConfirm={handleRemoveConfirm}
        confirmColor='red'
        confirmText={deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
        isLoading={deleteClassMutation.isPending}
      />

    </div>

  )
}

export default Overview
