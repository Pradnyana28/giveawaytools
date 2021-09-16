import readline from 'readline';

export async function ioInput(question: string, isRequire = false, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((res) => {
    rl.question(question, async (input) => {
      if (isRequire && input === "") {
        ioInput(question, isRequire);
      } else if (!isRequire && defaultValue) {
        res(defaultValue);
      } else {
        res(input);
      }
    });
  });
}