const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.post('/sync-to-notion', async (req, res) => {
    const { databaseId, taskType, setTime, actualTime, completed } = req.body;

    try {
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                '任务类型': { title: [{ text: { content: taskType } }] },
                '设定时间': { number: setTime },
                '实际时间': { number: actualTime },
                '是否完成': { checkbox: completed }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing to Notion:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));