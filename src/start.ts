
import { store } from './storage';
import { import_endpoints } from './endpoints';
import { listen, setup_plugins } from './http';

main();

async function main() {
	await store.setup();
	await setup_plugins();
	import_endpoints();
	listen();
}
