// suno-api.js

// Suno API interaction logic
const API_KEY = 'sk-RC4ixnYnvpH9jJ63835eD349E345494eBb2394FbF4E49553';
const SUBMIT_URL = 'https://api.gpt.ge/suno/submit/music';
const FETCH_URL_PREFIX = 'https://api.gpt.ge/suno/fetch/';

async function submitSunoMusicTask(lyrics, title, tags, mv = 'chirp-v3-5') {
    const payload = {
        prompt: lyrics,
        title: title,
        tags: tags,
        mv: mv,
        // notify_hook: '' // Optional callback URL
    };

    try {
        const response = await fetch(SUBMIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('Suno API submit error:', errorData);
            throw new Error(`API request failed: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        if (result.code && result.code.toLowerCase() === 'success' && result.data) {
            return result.data; // This is the task_id
        } else {
            console.error('Suno API submit failed with result:', result);
            throw new Error(result.message || 'Failed to submit music task to Suno API.');
        }
    } catch (error) {
        console.error('Error submitting Suno music task:', error);
        throw error;
    }
}

async function fetchSunoMusicResult(taskId) {
    const fetchUrl = `${FETCH_URL_PREFIX}${taskId}`;
    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('Suno API fetch error:', errorData);
            throw new Error(`API request failed: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        if (result.code && result.code.toLowerCase() === 'success' && result.data) {
            return result.data; // This is the task details object
        } else {
            console.error('Suno API fetch failed with result:', result);
            throw new Error(result.message || 'Failed to fetch music result from Suno API.');
        }
    } catch (error) {
        console.error('Error fetching Suno music result:', error);
        throw error;
    }
}

// If in browser environment and want global availability (or export via module system)
// window.sunoApi = { submitSunoMusicTask, fetchSunoMusicResult };

// Note: The following constants are redeclared above, commented out to avoid errors
// const API_KEY = 'sk-OpJiV7wCe0zE4LLN269306Ac5a974870BaE7439d0aF64504'; 
// const SUBMIT_URL = 'https://api.gpt.ge/suno/submit/lyrics';
// const FETCH_URL_BASE = 'https://api.gpt.ge/suno/fetch/'; 

// If the lyrics generation part indeed needs different API Key and URL, please use different constant names, e.g.:
const LYRICS_API_KEY = 'sk-OpJiV7wCe0zE4LLN269306Ac5a974870BaE7439d0aF64504';
const LYRICS_SUBMIT_URL = 'https://api.gpt.ge/suno/submit/lyrics';
const LYRICS_FETCH_URL_BASE = 'https://api.gpt.ge/suno/fetch/';


/**
 * Submits a lyrics generation task to the Suno API.
 * @param {string} prompt - The prompt used to generate lyrics.
 * @returns {Promise<string>} - Returns the task ID.
 */
async function submitLyricsGenerationTask(prompt) {
    console.log(`Submitting lyrics generation task, prompt: "${prompt}"`);
    const response = await fetch(LYRICS_SUBMIT_URL, { // Use new constant name
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LYRICS_API_KEY}`, // Use new constant name
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API error (submit task): ${response.status} - ${errorData}`);
        throw new Error(`API error (submit task): ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Submit task response:', result);

    if (result.code !== 'success' || !result.data) {
        throw new Error(`API error (submit task): Failed to get task ID. Response: ${JSON.stringify(result)}`);
    }
    return result.data; // task_id
}

/**
 * Polls the Suno API to get lyrics generation results.
 * @param {string} taskId - The task ID to query.
 * @returns {Promise<Object>} - Returns the final data of the task.
 */
async function pollForResult(taskId) {
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 10000;

    console.log(`Starting to poll for results of task ${taskId}...`);
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts} to get results for task ${taskId}...`);

        const response = await fetch(`${LYRICS_FETCH_URL_BASE}${taskId}`, { // Use new constant name
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${LYRICS_API_KEY}` // Use new constant name
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`API error (query task attempt ${attempts}): ${response.status} - ${errorData}`);
            if (attempts >= maxAttempts) {
                throw new Error(`API error (query task): ${response.status} - ${errorData}, max attempts reached.`);
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
        }

        const result = await response.json();
        console.log(`Query task attempt ${attempts} response:`, JSON.stringify(result)); // Print full response for debugging

        if (result.code === 'success' && result.data) {
            const taskInfo = result.data; // This is the first layer data
            console.log(`Task status: ${taskInfo.status}, progress: ${taskInfo.progress}`);

            if (taskInfo.status === 'SUCCESS' || taskInfo.status === 'COMPLETE') {
                console.log('Lyrics generation successful!');
                // According to the screenshot, lyrics are in result.data.data.text
                // taskInfo is result.data, so lyrics are in taskInfo.data.text
                if (taskInfo.data && typeof taskInfo.data.text !== 'undefined') { // Check if second layer data and text field exist
                    return taskInfo.data; // Return second layer data object, which contains text
                } else {
                    console.warn('Success status but expected lyrics data structure not found:', taskInfo.data);
                    throw new Error('Lyrics data structure not as expected.');
                }
            } else if (taskInfo.status === 'FAIL' || taskInfo.status === 'FAILED' || taskInfo.fail_reason) {
                throw new Error(`Lyrics generation failed: ${taskInfo.fail_reason || 'Unknown reason'}`);
            }
        } else {
            console.warn(`Unexpected query response structure for task ${taskId}:`, result);
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Lyrics generation task ${taskId} timed out after ${maxAttempts} attempts.`);
}

/**
 * Main function: Submits lyrics generation request and fetches results.
 * @param {string} lyricsPrompt - The prompt used to generate lyrics.
 * @returns {Promise<string|null>} - Returns the lyrics text, or null if failed.
 */
async function generateAndFetchLyrics(lyricsPrompt) {
    try {
        const taskId = await submitLyricsGenerationTask(lyricsPrompt);
        console.log(`Task submitted, ID: ${taskId}`);

        // pollForResult now returns the second layer data object containing lyrics
        const lyricsData = await pollForResult(taskId);
        
        if (lyricsData && typeof lyricsData.text !== 'undefined') { // Check if text field exists
            console.log("\n--- Generation Result ---");
            console.log(`  Lyrics: ${lyricsData.text}`);
            console.log("\n-----------------");
            return lyricsData.text; // Return lyrics text
        } else {
            console.log("未获取到有效的生成内容或歌词文本。实际获取到的数据:", lyricsData);
            return null; // 没有找到歌词则返回null
        }

    } catch (error) {
        console.error('\n处理歌词生成时发生严重错误:', error.message);
        return null; // 出错时返回null
    }
}

// --- 使用示例 ---
// 要运行此脚本，您可以在Node.js环境中调用 generateAndFetchLyrics 函数。
// 例如: node suno-api.js (如果您将下面的调用取消注释并通过命令行运行)
// 或者在另一个JS文件中导入并调用它。

/*
(async () => {
    const examplePrompt = "一首关于星际旅行的歌曲，风格是电子流行，中文";
    await generateAndFetchLyrics(examplePrompt);
})();
*/

// 如果您想在浏览器环境中使用此代码（例如，与app.html集成），
// 您需要确保：
// 1. 处理CORS问题（如果API不支持浏览器直接调用或需要代理）。
// 2. fetch API在现代浏览器中可用。
// 3. 将此脚本通过 <script src="suno-api.js"></script> 引入到HTML中，
//    并从您的其他脚本（如 lyrics-creator.js）中调用 generateAndFetchLyrics。

// 导出函数以便在其他模块中使用 (如果使用Node.js模块系统或ES模块)
// module.exports = { generateAndFetchLyrics }; // CommonJS
// export { generateAndFetchLyrics }; // ES Modules (需要调整package.json type="module" 或使用 .mjs)