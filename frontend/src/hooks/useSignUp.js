import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // Show success message
      toast.success("Account created successfully! Complete your profile to get started.");
      
      // Navigate immediately to onboarding page
      navigate("/onboarding");
      
      // Invalidate the auth user query to refetch the user data after navigation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }, 200);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create account");
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
