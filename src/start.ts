
import './endpoints';
import { listen } from './http';
import { store } from './storage';

main();

async function main() {
	await store.setup();
	listen();
}
