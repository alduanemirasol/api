const express = require('express');
const router = express.Router();

const validateKey = require('../middleware/validateKey');

const posts = [
  { id: 1, title: 'Hello World', content: 'First post!', author: 'Alice' },
  { id: 2, title: 'Express Rocks', content: 'Express is awesome', author: 'Bob' }
];

let nextPostId = 3;

router.get('/', (req, res) => {
  res.json({ success: true, data: posts });
});

router.get('/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
  res.json({ success: true, data: post });
});

router.post('/', validateKey, (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content required' });
  }
  const newPost = { id: nextPostId++, title, content, author: author || 'Anonymous' };
  posts.push(newPost);
  res.status(201).json({ success: true, data: newPost });
});

router.put('/:id', validateKey, (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
  
  const { title, content, author } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (author) post.author = author;
  
  res.json({ success: true, data: post });
});

router.delete('/:id', validateKey, (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Post not found' });
  
  posts.splice(index, 1);
  res.json({ success: true, message: 'Post deleted' });
});

module.exports = router;