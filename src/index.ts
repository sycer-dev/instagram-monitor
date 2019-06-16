import Monitor from './classes/Monitor';

new Monitor().init();

process.on('unhandledRejection', (r: any) => {
	console.error(`[UNHANDLED REJECTION] ${r}`);
});
