import { pipeline, env } from '@xenova/transformers';
env.remoteHost = '/huggingface';

class TaskBreakdownPipeline {
    static task = 'text-generation';
    static model = 'Xenova/distilgpt2';
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
    const prompt = `Break down the following task into a list of simple, actionable steps: ${taskString}. Return the steps as a numbered list.`;
    const result = await generator(prompt, {
        max_new_tokens: 100,
        num_beams: 4,
        early_stopping: true,
    });

    const textResult = result[0].generated_text;
    // The model sometimes includes the prompt in the result, so we remove it.
    const steps = textResult.replace(prompt, '').trim().split(/\n|\s*\d+\.\s*/).filter(s => s.trim().length > 0);
    return steps;
};
