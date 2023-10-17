import axios from 'axios';

export const api= axios.create({
    baseURL: 'https://api.clarifai.com',
    headers: {
        "Authorization": "key 9e2cf934dda74f459bb9c6c3bc029799"
    }
})  