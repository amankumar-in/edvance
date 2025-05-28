import {
  Box,
  Button,
  Callout,
  CheckboxGroup,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Select,
  Separator,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { ArrowLeft, Info, Plus } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import AsyncSelect from 'react-select/async';
import { searchParents, searchStudents } from '../../api/search/search.api';
import { useCreateTask } from '../../api/task/task.mutations';
import { toast } from 'sonner';

// Mock categories - replace with API data
const CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "home", label: "Home" },
  { value: "behavior", label: "Behavior" },
  { value: "extracurricular", label: "Extracurricular" },
  { value: "attendance", label: "Attendance" },
  { value: "system", label: "System" },
];

const CreateTask = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
    resetField,
    setValue
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: [],
      pointValue: 10,
      dueDate: new Date(),
      requiresApproval: true,
      approverType: 'none',
      category: '',
      selectedPeople: [],
      assigned: ''
    },
  });

  const requiresApproval = watch('requiresApproval') === 'true';
  const assigned = watch('assigned')

  const { mutate: createTask, isPending, isError, error } = useCreateTask();

  const onSubmit = async (data) => {
    const requiresApproval = data.requiresApproval === 'true';
    const assignedTo = {};
    assignedTo['role'] = assigned;

    if (data.selectedPeople.length > 0) {
      assignedTo['selectedPeopleIds'] = data.selectedPeople.map(person => person.value);
    } else {
      assignedTo['selectedPeopleIds'] = [];
    }

    if (!requiresApproval) {
      delete data.approverType;
    }

    delete data.selectedPeople;
    delete data.assigned;


    data.requiresApproval = requiresApproval;
    data.assignedTo = assignedTo;

    console.log(data);

    createTask(data, {
      onSuccess: () => {
        toast.success('Task created successfully');
        navigate('/platform-admin/dashboard/tasks');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to create task');
      }
    });
  };

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    if (assigned === 'student') {
      const response = await searchStudents({ email: inputValue });
      return response.data.students.map((student) => ({
        label: `${student?.user?.email}, ${student?.user?.firstName} ${student?.user?.lastName}`,
        value: student._id,
      }));
    }
    if (assigned === 'parent') {
      const response = await searchParents({ email: inputValue });
      return response.data.parents.map((parent) => ({
        label: `${parent?.user?.email}, ${parent?.user?.firstName} ${parent?.user?.lastName}`,
        value: parent._id,
      }));
    }
  }

  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <Box>
        <Button
          variant="ghost"
          color="gray"
          asChild
          size="2"
          className="mb-4"
        >
          <Link to={'/platform-admin/dashboard/tasks'}>
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
        </Button>
        <Heading as="h1" size="6" weight="medium">Create New Task</Heading>
        <Text color="gray" size="2" className="mt-1">
          Create a new task for students to complete and earn scholarship points.
        </Text>
      </Box>

      <Separator size="4" />

      {
        (isError) && (
          <Callout.Root
            color="red"
            variant="surface"
          >
            <Callout.Icon>
              <Info size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message ||
                "Failed to create task."}
            </Callout.Text>
          </Callout.Root>
        )
      }

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Flex gap="4" className="flex-col md:flex-row">
          <div className="flex-1">
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Task Title
              </Text>
              <TextField.Root placeholder="Enter task title" className="w-full" {...register('title', {
                required: "Task title is required"
              })} />
              <Text as="p" size="1" color="gray" mt="1">
                Choose a clear, descriptive title that explains what students need to do
              </Text>
              {errors.title && (
                <Text
                  as="p"
                  size={"2"}
                  color="red"
                  className='flex items-center gap-1 mt-1'
                >
                  <Info size={14} /> {errors.title.message}
                </Text>
              )}
            </label>
          </div>

          <div className="flex-1">
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Scholarship Points
              </Text>
              <TextField.Root type="number" placeholder="Enter points" className="w-full" {...register('pointValue', {
                valueAsNumber: true,
                required: "Scholarship points are required",
                min: {
                  value: 1,
                  message: "Points must be greater than 0"
                }
              })} />
              <Text as="p" size="1" color="gray" mt="1">
                Assign point values based on task complexity and effort required
              </Text>
              {errors.pointValue && (
                <Text
                  as="p"
                  size={"2"}
                  color="red"
                  className='flex items-center gap-1 mt-1'
                >
                  <Info size={14} /> {errors.pointValue.message}
                </Text>
              )}
            </label>
          </div>
        </Flex>
        <Flex gap="4" className="flex-col md:flex-row">
          <div className='flex-1'>
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Task Description
              </Text>
              <TextArea placeholder="Enter task description"
                {...register("description")}
                className="w-full" />
              <Text as="p" size="1" color="gray" mt="1">
                Provide clear instructions and all details needed to complete the task successfully
              </Text>
            </label>
          </div>

          <div className='flex-1'>
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Task Category
              </Text>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Please select a category' }}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger placeholder="Select category" className="w-full" />
                    <Select.Content variant="soft" position="popper">
                      {CATEGORIES.map((category) => (
                        <Select.Item key={category.value} value={category.value}>
                          {category.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </label>
            <Text as="p" size="1" color="gray" mt="1">
              Select the category that best describes the task
            </Text>
            {errors.category && (
              <Text
                as="p"
                size={"2"}
                color="red"
                className='flex items-center gap-1 mt-1'
              >
                <Info size={14} /> {errors.category.message}
              </Text>
            )}
          </div>

        </Flex>
        <Flex gap="4" className="flex-col md:flex-row">
          <div className="flex-1">
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Due Date
              </Text>
              <TextField.Root type="date" className="w-full" {...register('dueDate', {
                valueAsDate: true,
                validate: (value) => {
                  if (!value) return true;

                  if (!(value instanceof Date) || isNaN(value.getTime())) return true
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // zero out time
                  return value >= today || "Due date must be today or in the future";
                },
              })} />
              <Text as="p" size="1" color="gray" mt="1">
                Set a reasonable deadline that gives students enough time to complete the task
              </Text>
              {errors.dueDate && (
                <Text
                  as="p"
                  size={"2"}
                  color="red"
                  className='flex items-center gap-1 mt-1'
                >
                  <Info size={14} /> {errors.dueDate.message}
                </Text>
              )}
            </label>
          </div>


          <div className="flex-1">
            <Text as="label" htmlFor='assigned' size="2" mb="2" weight="medium">
              Assigned To
            </Text>
            <div>
              <Flex align="start" gap="4">
                <Flex asChild gap="2">
                  <Text as="label" size="2">
                    <Radio id='assigned' {...register('assigned', {
                      required: "Assigned to is required"
                    })} value="parent" />
                    Parent
                  </Text>
                </Flex>

                <Flex asChild gap="2">
                  <Text as="label" size="2">
                    <Radio id='assigned' {...register('assigned', {
                      required: "Assigned to is required"
                    })} value="student" />
                    Student
                  </Text>
                </Flex>

                <Flex asChild gap="2">
                  <Text as="label" size="2">
                    <Radio id='assigned' {...register('assigned', {
                      required: "Assigned to is required"
                    })} value="school" />
                    School
                  </Text>
                </Flex>
              </Flex>
              {errors.assigned && (
                <Text
                  as="p"
                  size={"2"}
                  color="red"
                  className='flex items-center gap-1 mt-1'
                >
                  <Info size={14} /> {errors.assigned.message}
                </Text>
              )}
              {!!assigned && (
                <Callout.Root variant='surface' mt={'4'}>
                  <Callout.Icon>
                    <Info size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    This task will be visible to all {assigned}s.
                    To assign it to specific {assigned}s only, select them from the list below.
                  </Callout.Text>
                </Callout.Root>
              )}
              {!!assigned && (
                <div className='mt-4'>
                  <Controller
                    name="selectedPeople"
                    control={control}
                    defaultValue={[]} // 👈 ensure this default is set
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        isMulti
                        cacheOptions
                        defaultOptions={false}
                        loadOptions={loadOptions}
                        onChange={field.onChange}
                        value={field.value} // 👈 critical: ensure the value is managed
                        placeholder={`Search and select ${assigned}s...`}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </Flex>

        <Flex gap="4" className="flex-col md:flex-row">
          <div className="flex-1">
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Requires Approval
              </Text>
              <Flex align="start" gap="4">
                <Flex asChild gap="2">
                  <Text as="label" size="2">
                    <Radio {...register('requiresApproval')} value={true} defaultChecked />
                    Yes
                  </Text>
                </Flex>

                <Flex asChild gap="2">
                  <Text as="label" size="2">
                    <Radio {...register('requiresApproval')} value={false} />
                    No
                  </Text>
                </Flex>
              </Flex>
            </label>
            <Text as="p" size="1" color="gray" mt="1">
              Select whether the task requires approval or not
            </Text>
          </div>

          {requiresApproval && <div className='flex-1'>
            <label>
              <Text as="div" size="2" mb="2" weight="medium">
                Who can approve this task?
              </Text>
              <Controller
                name="approverType"
                control={control}
                rules={{ required: "Approver type is required" }}
                render={({ field }) => (
                  <RadioGroup.Root
                    defaultValue="none"
                    name="approverType"
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <Flex gap='2' wrap='wrap'>
                      <RadioGroup.Item value="parent">Parent</RadioGroup.Item>
                      <RadioGroup.Item value="teacher">Teacher</RadioGroup.Item>
                      <RadioGroup.Item value="school_admin">School Admin</RadioGroup.Item>
                      <RadioGroup.Item value="social_worker">Social Worker</RadioGroup.Item>
                      <RadioGroup.Item value="platform_admin">Platform Admin</RadioGroup.Item>
                      <RadioGroup.Item value="system">System</RadioGroup.Item>
                      <RadioGroup.Item value="none">None</RadioGroup.Item>
                    </Flex>
                  </RadioGroup.Root>
                )}
              />

              <Text as="p" size="1" color="gray" mt="1">
                Select all user roles that should be allowed to approve task
              </Text>
            </label>
          </div>}
        </Flex>



        <Flex gap="3" align="center" mt="4">
          <Button
            type="submit"
            color="grass"
            disabled={isPending}
          >
            <Plus size={16} /> {isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </Flex>
      </form>
    </div >
  );
};

export default CreateTask; 