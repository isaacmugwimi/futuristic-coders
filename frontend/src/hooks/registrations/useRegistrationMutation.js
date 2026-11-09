"use client";

import { useMutation } from "@tanstack/react-query";
import { submitRegistration } from "../../services/registrations/registration.service";

export const useSubmitRegistration = () => {
  return useMutation({
    mutationFn: submitRegistration,
    // No retry: a repeated POST could create a duplicate request.
  });
};