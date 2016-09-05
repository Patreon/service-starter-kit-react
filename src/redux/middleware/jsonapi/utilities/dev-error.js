import guardExecution from './guard-execution';

export default guardExecution(console.error.bind(console), process.env.NODE_ENV !== 'production');
