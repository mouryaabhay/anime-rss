export default function areCommandsDifferent(existingCommand, localCommand) {
  // Helper function to check if choices are different
  const areChoicesDifferent = (existingChoices, localChoices) => {
    const existingChoicesMap = new Map(
      existingChoices.map(choice => [choice.name, choice])
    );

    for (const localChoice of localChoices) {
      const existingChoice = existingChoicesMap.get(localChoice.name);

      if (!existingChoice) return true; // New choice added
      if (localChoice.value !== existingChoice.value) return true; // Value mismatch
    }

    return false;
  };

  // Helper function to check if options are different
  const areOptionsDifferent = (existingOptions, localOptions) => {
    const existingOptionsMap = new Map(
      existingOptions.map(option => [option.name, option])
    );

    for (const localOption of localOptions) {
      const existingOption = existingOptionsMap.get(localOption.name);

      if (!existingOption) return true; // New option added

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== existingOption.required ||
        (localOption.choices?.length || 0) !==
        (existingOption.choices?.length || 0) ||
        areChoicesDifferent(
          localOption.choices || [],
          existingOption.choices || []
        )
      ) {
        return true;
      }
    }

    return false;
  };

  // Main comparison logic
  if (
    existingCommand.description !== localCommand.description ||
    existingCommand.options?.length !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options || [], localCommand.options || [])
  ) {
    return true; // Commands are different
  }

  return false; // Commands are the same
}
