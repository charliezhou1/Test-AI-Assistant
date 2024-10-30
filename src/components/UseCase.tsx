import React, { useState, ChangeEvent } from "react";
import { SelectField } from "@aws-amplify/ui-react";
type UseCaseProps = {
  selectedUseCase: string;
  onSelect: (useCase: string) => void;
};

const UseCase: React.FC<UseCaseProps> = ({ selectedUseCase, onSelect }) => {
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value); // Pass the selected value to Chat.tsx
  };
  return (
    <SelectField
      label="Select Test Use Case"
      name="use-case"
      value={selectedUseCase}
      onChange={handleSelectChange}
    >
      <option value="use-case-1">
        Generate user story, derive test specifications and automate them
      </option>
      <option value="use-case-2">
        Generate API test cases and automate them
      </option>
      <option value="use-case-3">Generate test strategy and plan</option>
      <option value="use-case-4">
        Generate functional test cases and analyze Jira user stories
      </option>
    </SelectField>
  );
};

export default UseCase;

