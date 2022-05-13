
import { HttpError } from './http-error';
import { FastifyRequest } from 'fastify';
import { create as create_xml } from 'xmlbuilder2';
import { XMLParser, XMLValidator, X2jOptions } from 'fast-xml-parser';

export function xml_rpc_fault(code: number, message: string) {
	const doc = create_xml();
	const resp = doc.ele('methodResponse');
	const struct = resp.ele('fault').ele('value').ele('struct');
	const fault_code = struct.ele('member');
	fault_code.ele('name').txt('faultCode');
	fault_code.ele('value').ele('int').txt(code.toString());
	const fault_string = struct.ele('member');
	fault_string.ele('name').txt('faultString');
	fault_string.ele('value').ele('string').txt(message);
	return doc.toString();
}

export function xml_content_processor(req: FastifyRequest, payload: string, done: (err: Error | null, body?: any) => void) {
	const opts: Partial<X2jOptions> = { };
	const xmlParser = new XMLParser(opts);
	const result = XMLValidator.validate(payload, opts);

	if (typeof result === 'object' && result.err) {
		done(new HttpError(422, result.err.msg));
		return;
	}

	done(null, xmlParser.parse(payload));
}
