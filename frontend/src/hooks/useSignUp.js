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
      // Invalidate the auth user query to refetch the user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Show success message
      toast.success("Account created successfully! Complete your profile to get started.");
      
      // Navigate to onboarding page
      setTimeout(() => {
        navigate("/onboarding");
      }, 100); // Small delay to ensure query invalidation is processed
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create account");
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
