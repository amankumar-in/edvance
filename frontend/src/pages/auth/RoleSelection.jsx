import { Text } from '@radix-ui/themes';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import MyButton from '../../components/MyButton';
import {
  FaChalkboardTeacher,
  MdCheckCircle,
  MdDomain,
  MdGroups,
  MdSchool,
  RiParentFill
} from '../../icons/index';

// User roles with icons
export const roleOptions = [
  {
    id: 'STUDENT',
    title: 'Student',
    icon: MdSchool,
    gradient: ['#FF8DA1', '#FF6B85'],
  },
  {
    id: 'PARENT',
    title: 'Parent',
    icon: RiParentFill,
    gradient: ['#FFC2BA', '#FFAD9F'],
  },
  {
    id: 'SOCIAL_WORKER',
    title: 'Social Worker',
    icon: MdGroups,
    gradient: ['#64B5F6', '#2196F3'],
  },
  {
    id: 'TEACHER',
    title: 'Teacher',
    icon: FaChalkboardTeacher,
    gradient: ['#FF9CE9', '#FF7DE0'],
  },
  {
    id: 'SCHOOL',
    title: 'School Admin',
    icon: MdDomain,
    gradient: ['#AD56C4', '#9548A8'],
  },
];

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    navigate(`/register?role=${selectedRole}`);
  };

  return (
    <div className="relative z-10 w-full max-w-lg space-y-6 text-[--gray-1] rounded-2xl ">
      <div className="text-center">
        <Text as="p" size={'8'} weight={'bold'}>
          Welcome to Univance
        </Text>
        <Text as="p" size={'4'} mt={'4'}>
          Let's start by selecting your role
        </Text>
      </div>

      {/*Role Selection Cards */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {roleOptions.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 py-3 text-white transition-transform border rounded-2xl cursor-pointer hover:scale-[1.02] flex-col flex justify-center ${isSelected ? 'border-[--gray-6]' : 'bg-gradient-to-br from-white/10 to-white/20 border-[--gray-9] hover:border-[--gray-6]'} relative focus:outline-none focus-visible:ring-2 ring-[--focus-8]`}
              style={{
                background:
                  selectedRole === role.id
                    ? `linear-gradient(to right, ${role.gradient[0]}, ${role.gradient[1]})`
                    : undefined,
              }}
            >
              {/* Check icon */}
              {isSelected && <div className='absolute top-3 right-3'>
                <MdCheckCircle className='size-6' />
              </div>}

              {/* Icon and text */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center rounded-full size-14"
                  style={{
                    background:
                      isSelected
                        ? 'transparent' // neutral or faded when selected
                        : `linear-gradient(to right, ${role.gradient[0]}, ${role.gradient[1]})`,
                  }}
                >
                  {role.icon && <role.icon className='size-8' />}
                </div>
                <Text as="span" weight="bold" align="center">
                  {role.title}
                </Text>
              </div>
            </button>

          )
        })}
      </div>

      <div className='text-center'>
        <MyButton
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Continue
        </MyButton>
      </div>
      <Text as="div" align={'center'}>
        Already have an account?{" "}
        <Link
          to={'/login'}
          className="underline">
          <Text as="span" weight={'medium'}>
            Login
          </Text>
        </Link>
      </Text>
    </div>
  )
}

export default RoleSelection