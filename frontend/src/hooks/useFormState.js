import { useState } from "react";

export const useFormState = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setFieldValue = (name, value) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors);
    return nextErrors;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    setValues,
    setErrors,
    handleChange,
    setFieldValue,
    validateForm,
    resetForm,
  };
};
