import React, { useState } from 'react'
import { useGetTeacherClasses } from '../../api/teacher/teacher.queries'
import { ConfirmationDialog, EmptyStateCard, ErrorCallout, Loader, PageHeader } from '../../components'
import { BookOpen, Edit2Icon, Key, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button, Card, Flex, IconButton, Inset, Text, Tooltip } from '@radix-ui/themes';
import Honors from '../../assets/Honors.jpg'
import { Link } from 'react-router';
import GenerateJoinCodeDialog from '../school-admin/components/GenerateJoinCodeDialog';
import { BarLoader } from 'react-spinners';
import { useDeleteClass } from '../../api/school-class/schoolClass.mutations';
import CreateClassDialog from '../school-admin/components/CreateClassDialog';
import { useAuth } from '../../Context/AuthContext';

function TeacherClasses() {
  const { profiles } = useAuth()
  const teacherProfile = profiles?.['teacher']

  const { data, isLoading, isFetching, isError, error } = useGetTeacherClasses();
  const classes = data?.data || [];

  const deleteClassMutation = useDeleteClass();

  const [openCreateClassDialog, setOpenCreateClassDialog] = useState(false);

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedClassToRemove, setSelectedClassToRemove] = useState(null);

  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [selectedClassToEdit, setSelectedClassToEdit] = useState(null);

  const handleDeleteClass = (e, cls) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClassToRemove(cls);
    setIsRemoveDialogOpen(true);
  }

  const [isGenerateCodeDialogOpen, setIsGenerateCodeDialogOpen] = useState(false);
  const [selectedClassForCode, setSelectedClassForCode] = useState(null);

  const handleNewJoinCode = (e, cls) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClassForCode(cls);
    setIsGenerateCodeDialogOpen(true);
  }

  const handleEditClass = (e, cls) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClassToEdit(cls);
    setIsEditClassDialogOpen(true);
  }

  const handleRemoveConfirm = () => {
    if (selectedClassToRemove?._id) {
      deleteClassMutation.mutate(selectedClassToRemove._id, {
        onSuccess: () => {
          setIsRemoveDialogOpen(false);
          setSelectedClassToRemove(null);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <ClassesHeader />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='space-y-6'>
        <ClassesHeader />
        <ErrorCallout
          errorMessage={error?.response?.data?.message || error?.message || 'Failed to load classes'}
        />
      </div>
    );
  }

  return (
    <>
      {isFetching && (
        <div className='flex fixed top-0 right-0 left-0 z-50'>
          <BarLoader
            color='#00a2c7'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <div className='space-y-6'>
        <ClassesHeader handleCreateClass={() => setOpenCreateClassDialog(true)} />
        {classes?.length > 0 ? (
          <div className='grid gap-6'
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 300px))" }}>
            {classes?.map((cls) => (
              <>
                <ClassCard
                  cls={cls}
                  handleNewJoinCode={handleNewJoinCode}
                  handleDeleteClass={handleDeleteClass}
                  handleEditClass={handleEditClass}
                />
              </>
            ))}
          </div>
        ):(
          <EmptyStateCard
            title='No classes found'
            description='You have not created any classes yet. Create a class to get started.'
            icon={<BookOpen size={24} />}
            action={<CreateClassButton handleCreateClass={() => setOpenCreateClassDialog(true)} />}
          />
        )}

      </div>

      <GenerateJoinCodeDialog
        open={isGenerateCodeDialogOpen}
        onOpenChange={() => {
          setIsGenerateCodeDialogOpen(false);
          setSelectedClassForCode(null);
        }}
        schoolClass={selectedClassForCode}
      />

      <ConfirmationDialog
        title='Delete Class'
        description={
          selectedClassToRemove
            ? `Are you sure you want to delete ${selectedClassToRemove.name} class?`
            : 'Are you sure you want to delete this class?'
        }
        open={isRemoveDialogOpen}
        onOpenChange={() => {
          setIsRemoveDialogOpen(false);
          setSelectedClassToRemove(null);
        }}
        onConfirm={handleRemoveConfirm}
        confirmColor='red'
        confirmText={deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
        isLoading={deleteClassMutation.isPending}
      />

      {openCreateClassDialog && <CreateClassDialog
        open={openCreateClassDialog}
        onOpenChange={setOpenCreateClassDialog}
        isEdit={false}
        teacherProfile={teacherProfile}
      />}

      <CreateClassDialog
        open={isEditClassDialogOpen}
        onOpenChange={() => {
          setIsEditClassDialogOpen(false);
          setSelectedClassToEdit(null);
        }}
        isEdit={true}
        selectedClass={selectedClassToEdit}
        teacherProfile={teacherProfile}
      />
    </>
  )
}

export default TeacherClasses

function ClassCard({ cls, handleNewJoinCode, handleDeleteClass, handleEditClass }) {
  const schedule = cls?.schedule?.map((s) => s.dayOfWeek.slice(0, 3))

  return (
    <Card key={cls._id} size={'2'} className='flex flex-col justify-between shadow-md transition hover:shadow-lg aspect-square' asChild>
      <Link to={`/teacher/classes/${cls._id}`}>

        <div className='space-y-4'>
          <Inset clip="padding-box" side="top" className='relative'>
            <img src={Honors} alt=""
              className='object-cover object-center w-full h-24'
            />
            <div className='absolute inset-0 bg-gradient-to-b to-transparent from-black/40' />
            <div className='absolute top-2 left-2'>
              <Text as='p' className='text-white line-clamp-1' size='5' weight={'medium'}>{cls?.name ?? 'No name'}</Text>
              <Text as='p' size='2' className='text-white'>{cls?.grade ?? 'No grade'}</Text>
            </div>
          </Inset>

          <div className='space-y-2'>
            <Flex align='center' gap='2'>
              <Text as='p' color='gray' size='2'>
                Join Code:
              </Text>
              <Text as='p' className='font-mono select-all' size='2'>
                {cls?.joinCode ?? 'No join code'}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              <Text as='p' color='gray' size='2'>
                Students:
              </Text>
              <Text as='p' size='2'>
                {cls?.studentIds?.length ?? 'No students'}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              <Text as='p' color='gray' size='2'>
                Schedule:
              </Text>
              <Text as='p' size='2'>
                {schedule?.join(', ') ?? 'No schedule'}
              </Text>
            </Flex>

          </div>
        </div>
        <div className='pt-2 border-t border-[--gray-a6]'>
          <Text as='div' size='1' color='gray' className='flex gap-4 justify-end items-center w-full'>
            <Tooltip content='Edit Class'>
              <IconButton
                variant='ghost'
                size='1'
                color='gray'
                onClick={(e) => handleEditClass(e, cls)}
              >
                <Edit2Icon size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip content='Delete Class'>
              <IconButton
                variant='ghost'
                size='1'
                color='gray'
                onClick={(e) => handleDeleteClass(e, cls)}
              >
                <Trash2Icon size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip content='New Join Code'>
              <IconButton
                variant='ghost'
                size='1'
                color='gray'
                onClick={(e) => handleNewJoinCode(e, cls)}
              >
                <Key size={16} />
              </IconButton>
            </Tooltip>
          </Text>
        </div>
      </Link>
    </Card>

  )
}


function ClassesHeader({ handleCreateClass }) {
  return (
    <PageHeader
      title="Classes"
      description="Manage your classes"
    >
      <CreateClassButton handleCreateClass={handleCreateClass} />
    </PageHeader>
  )
}

function CreateClassButton({ handleCreateClass }) {
  return (
    <Button
      className='shadow-md'
      onClick={handleCreateClass}
    >
      <PlusIcon size={16} /> Create Class
    </Button>
  )
}
