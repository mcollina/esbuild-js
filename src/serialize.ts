import { AstNode } from "./ast";

export interface SerializeOptions {
	indentChar?: string;
	newLineChar?: string;
}

export function serialize(node: AstNode, options: SerializeOptions = {}) {
	const indentChar = "indentChar" in options ? options.indentChar || "" : "  ";
	const newLineChar =
		"newLineChar" in options ? options.newLineChar || "" : "\n";

	// TODO: Hoist this?
	const indentCache: string[] = [];
	const indent = (n: number) => {
		if (n >= indentCache.length) {
			indentCache[n] = indentChar.repeat(n);
		}
		return indentCache[n];
	};

	return serializeAst(node, null, 0, false, {
		indentChar,
		indent,
		newLineChar,
	});
}

export interface InternalSerialize extends Required<SerializeOptions> {
	indent: (level: number) => string;
}

function serializeAst(
	node: AstNode,
	parent: AstNode | null,
	level: number,
	skipIndent: boolean,
	options: InternalSerialize
): string {
	const { indentChar, newLineChar } = options;
	let out = "";

	switch (node.type) {
		case "Identifier":
			out += node.name;
			break;
		case "Literal":
			out += node.raw;
			break;
		case "ObjectPattern": {
			out += "{";
			for (let i = 0; i < node.properties.length; i++) {
				out += serializeAst(
					node.properties[i],
					node,
					level,
					skipIndent,
					options
				);
				if (i + 1 < node.properties.length) {
					out += ", ";
				}
			}
			out += "}";
			break;
		}
		case "ObjectExpression": {
			out += "{";
			if (node.properties.length > 1) {
				out += options.newLineChar;
			}

			for (let i = 0; i < node.properties.length; i++) {
				out += serializeAst(
					node.properties[i],
					node,
					level + 1,
					skipIndent,
					options
				);
				if (i + 1 < node.properties.length) {
					out += "," + options.newLineChar;
				}
			}
			out += "}";
			return out;
		}
		case "Property": {
			if (node.key === node.value) {
				return serializeAst(node.key, node, level + 1, skipIndent, options);
			}

			if (node.computed) {
				out += "[";
			} else if (!skipIndent) {
				out += options.indent(level);
			}
			out += serializeAst(node.key, node, level, skipIndent, options);
			if (node.computed) {
				out += "]";
			}
			if (!node.method) {
				out += ": ";
			}
			out += serializeAst(node.value, node, level, skipIndent, options);
			return out;
		}
		case "ClassDeclaration":
			{
				out += "class ";
				if (node.name) {
					out += node.name.name + " ";
				}
				if (node.extend) {
					out +=
						serializeAst(node.extend, node, level, skipIndent, options) + " ";
				}
			}
			out += "{" + options.newLineChar;
			for (let i = 0; i < node.properties.length; i++) {
				out += serializeAst(
					node.properties[i],
					node,
					level + 1,
					skipIndent,
					options
				);
			}
			out += "}" + options.newLineChar;
			return out;
		case "VariableDeclaration": {
			out += node.kind + " ";
			for (let i = 0; i < node.declarations.length; i++) {
				out += serializeAst(
					node.declarations[i],
					node,
					level,
					skipIndent,
					options
				);
				if (i + 1 < node.declarations.length) {
					out += ", ";
				}
				if (
					!parent ||
					(parent.type !== "ForInStatement" &&
						parent.type !== "ForOfStatement" &&
						parent.type !== "ForStatement")
				) {
					out += ";";
					if (newLineChar) {
						out += newLineChar;
					}
				}
			}
			break;
		}
		case "VariableDeclarator": {
			out += serializeAst(node.id, node, level, skipIndent, options);
			if (node.init) {
				out +=
					" = " + serializeAst(node.init, node, level, skipIndent, options);
			}
			break;
		}
		case "ArrayExpression": {
			out += "[";
			for (let i = 0; i < node.elements.length; i++) {
				out += serializeAst(node.elements[i], node, level, skipIndent, options);
				if (
					i + 1 < node.elements.length ||
					node.elements[i].type === "EmptyExpression"
				) {
					out += ",";
				}
			}
			out += "]";
			if (!parent || parent.type === "Program") {
				out += ";\n";
			}
			return out;
		}
		case "BlockStatement": {
			out += "{";
			if (node.body.length === 0) {
				return out + "}" + options.newLineChar;
			}

			out += options.newLineChar;

			for (let i = 0; i < node.body.length; i++) {
				out += serializeAst(
					node.body[i],
					node.body[i],
					level + 1,
					skipIndent,
					options
				);
			}
			out += options.indent(level) + "}";
			if (options.newLineChar) {
				out += options.newLineChar;
			}
			return out;
		}
		case "FunctionDeclaration": {
			if (node.async) {
				out += "async ";
			}
			if (!parent || parent.type !== "Property" || !parent.method) {
				out += "function";
			}
			if (node.generator) {
				out += "* ";
			}

			if (!node.generator && node.name) {
				out += " ";
			}
			if (node.name) {
				out += node.name;
			}
			out += "(";
			for (let i = 0; i < node.params.length; i++) {
				out += serializeAst(node.params[i], node, level, skipIndent, options);
				if (i + 1 < node.params.length) {
					out += ",";
				}
			}

			out += ") ";
			out += serializeAst(node.body, node, level, skipIndent, options);
			return out;
		}
		case "ForStatement": {
			out += "for (";
			if (node.init)
				out += serializeAst(node.init, node, level, skipIndent, options);
			out += ";";
			if (node.test)
				out += serializeAst(node.test, node, level, skipIndent, options);
			out += ";";
			if (node.update)
				out += serializeAst(node.update, node, level, skipIndent, options);
			out += ")";
			out += serializeAst(node.body, node, level, skipIndent, options);
			return out;
		}
		case "ForInStatement": {
			return (
				"for (" +
				serializeAst(node.left, node, 0, skipIndent, options) +
				" in " +
				serializeAst(node.right, node, 0, skipIndent, options) +
				")" +
				serializeAst(node.body, node, level + 1, skipIndent, options)
			);
		}
		case "ForOfStatement": {
			return (
				"for (" +
				serializeAst(node.left, node, 0, skipIndent, options) +
				" of " +
				serializeAst(node.right, node, 0, skipIndent, options) +
				")" +
				serializeAst(node.body, node, level + 1, skipIndent, options)
			);
		}
		case "ExpressionStatement": {
			out += serializeAst(node.expression, node, level, skipIndent, options);

			if (
				parent &&
				parent.type !== "ForStatement" &&
				parent.type !== "ForInStatement" &&
				parent.type !== "ForOfStatement" &&
				node.expression.type !== "ClassDeclaration"
			) {
				out += ";\n";
			}
			return out;
		}
		case "UpdateExpression":
			if (node.prefix) {
				out += node.operator;
			}
			out += serializeAst(node.argument, node, 0, skipIndent, options);
			if (!node.prefix) {
				out += node.operator;
			}
			return out;
		case "SequenceExpression":
			const len = node.expressions.length;
			if (len === 1) {
				const expr = node.expressions[0];
				if (
					expr.type === "UnaryExpression" &&
					expr.operator === "+" &&
					expr.argument.type === "Literal"
				) {
					return serializeAst(expr, node, 0, true, options);
				}
			}

			out += "(";
			for (let i = 0; i < len; i++) {
				out += serializeAst(node.expressions[i], node, 0, true, options);
				if (i + 1 < len) {
					out += ", ";
				}
			}
			out += ")";
			return out;
		case "UnaryExpression": {
			if (node.operator !== "+" || node.argument.type !== "Literal") {
				out += node.operator;
				// Operators: void, delete, typeof
				if (node.operator.length > 1) {
					out += " ";
				}
			}
			out += serializeAst(node.argument, node, 0, skipIndent, options);
			return out;
		}
		case "BinaryExpression": {
			return (
				serializeAst(node.left, node, 0, skipIndent, options) +
				" " +
				node.operator +
				" " +
				serializeAst(node.right, node, 0, skipIndent, options)
			);
		}
		case "EmptyStatement": {
			out += ";";
			if (options.newLineChar) {
				out += options.newLineChar;
			}
			return out;
		}
		case "EmptyExpression": {
			return "";
		}
		case "Program": {
			if (node.hashbang) {
				out += node.hashbang + "\n";
			}
			for (let i = 0; i < node.body.length; i++) {
				out += serializeAst(node.body[i], node, 0, skipIndent, options);
			}

			return out;
		}

		default:
			console.log(node);
			throw new Error(`No serializer found`);
	}

	return out;
}
