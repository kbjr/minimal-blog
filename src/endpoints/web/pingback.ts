
import { web } from '../../http';
import { create as create_xml } from 'xmlbuilder2';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { xml_rpc_fault } from '../../xml-rpc';

type Req = FastifyRequest<{
	Body: {
		'?xml': '';
		methodCall: {
			methodName: 'pingback.ping';
			params: {
				param: [
					{ value: { string: string } },
					{ value: { string: string } }
				];
			};
		};
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			properties: {
				'?xml': { type: 'string' },
				methodCall: {
					type: 'object',
					properties: {
						methodName: {
							type: 'string',
							enum: [ 'pingback.ping' ]
						},
						params: {
							type: 'object',
							properties: {
								param: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											value: {
												type: 'object',
												properties: {
													string: { type: 'string' }
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

web.post('/pingback', opts, async (req: Req, res) => {
	res.status(200);
	res.type('text/xml');

	// SEE: https://www.hixie.ch/specs/pingback/pingback
	// TODO: Validate pingback and register
	// TODO: Re-render post with new interaction

	// // 
	// xml_rpc_fault(0x0010, 'Source URI does not exist');

	// // 
	// xml_rpc_fault(0x0011, 'Source does not contain a link to the target');

	// // 
	// xml_rpc_fault(0x0020, 'Target URI does not exist');

	// // 
	// xml_rpc_fault(0x0021, 'Target URI is not a valid target');

	// // 
	// xml_rpc_fault(0x0030, 'Pingback already registered');

	// // 
	// xml_rpc_fault(0x0031, 'Access denied');

	return pingback_success('Pingback submitted for review successfully.');
});

function pingback_success(message: string) {
	const doc = create_xml();
	const resp = doc.ele('methodResponse');
	const value = resp.ele('params').ele('param').ele('value');
	value.ele('string').txt(message);
	return doc.toString();
}
