import { pipeline, env } from '@xenova/transformers';
env.remoteHost = '/huggingface';

class TaskBreakdownPipeline {
    static task = 'text2text-generation';
    static model = 'Xenova/flan-t5-small';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export const breakdownTask = async (taskString, progress_callback = null) => {
    const generator = await TaskBreakdownPipeline.getInstance(progress_callback);
    const prompt = `Break down the following task into a numbered list of simple, actionable steps: ${taskString}`;
    const result = await generator(prompt, {
        max_new_tokens: 100,
        num_beams: 4,
        early_stopping: true,
    });

    const textResult = result[0].generated_text;
    // Split the result into steps, removing any numbering.
    const steps = textResult.trim().split(/\n|\s*\d+\.\s*/).filter(s => s.trim().length > 0);
    return steps;
};
