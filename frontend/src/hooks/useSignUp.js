import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("🎉 Signup successful! Response:", data);
      
      // Show success message
      toast.success("Account created successfully! Complete your profile to get started.");
      
      // Update the query cache immediately with the user data
      if (data.user) {
        queryClient.setQueryData(["authUser"], { user: data.user });
        console.log("✅ Updated auth user in cache:", data.user);
      }
      
      // Navigate immediately to onboarding page
      console.log("� Calling navigate('/onboarding')");
      navigate("/onboarding");
      console.log("✅ Navigate called");
    },
    onError: (error) => {
      console.log("❌ Signup failed:", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
