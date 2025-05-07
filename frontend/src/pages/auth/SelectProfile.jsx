import { Text } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import MyButton from "../../components/MyButton";
import { useAuth } from "../../Context/AuthContext";
import { useRole } from "../../Context/RoleContext";
import { buildSelectionList } from "../../utils/helperFunctions";
import AuthLayout from "./AuthLayout";

function SelectProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectionList, setSelectionList] = useState(state?.selectionList || []);
  const { fetchProfile, handleLogout } = useAuth();
  const { activeRole, setActiveRole } = useRole()
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (!state?.selectionList) {
      fetchProfile().then(data => {
        const rebuiltList = buildSelectionList(data.user, data.profiles);
        setSelectionList(rebuiltList);
      })
    }
  }, []);

  const handleContinue = () => {
    if (!selectedProfile) return;

    setActiveRole(selectedProfile.value);
    navigate(selectedProfile.route)
  };

  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-lg space-y-6 text-[--gray-1] rounded-2xl">
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"}>
            Select Your Profile
          </Text>
          <Text as="p" size={"4"} mt={"4"}>
            Choose which profile you want to use
          </Text>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {selectionList.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => setSelectedProfile(item)}
                className={`w-full p-4 rounded-xl text-[--gray-1] border transition-all ${selectedProfile?.value === item.value
                  ? "bg-gradient-to-br from-[--blue-8] to-[--blue-10] border-[--gray-8]"
                  : "  bg-gradient-to-br from-white/10 to-white/20 hover:border-[--gray-8] border-[--gray-10]"
                  }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <MyButton disabled={!selectedProfile} onClick={handleContinue}>
            Continue
          </MyButton>
        </div>

        {/* Link to log out and switch accounts */}
        <Text as="div" align={"center"}>
          Want to use a different account?{" "}
          <Link
            to={"/login"}
            className="underline"
            onClick={handleLogout}
          >
            <Text as="span" weight={"medium"}>
              Log out
            </Text>
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
}

export default SelectProfile; 