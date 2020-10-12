// Note: Order is used for comparison
export const enum Token {
	EndOfFile,
	SyntaxError,

	/** #!/usr/bin/env node */
	Hashbang,

	// Literals
	NoSubstitutionTemplateLiteral,
	NumericLiteral,
	StringLiteral,
	BigIntLiteral,

	// Pseudo literals
	TemplateMiddle,
	TemplateHead,
	TemplateTail,

	// Punctuation
	At,
	CloseBrace,
	CloseBracket,
	CloseParen,
	OpenBrace,
	OpenBracket,
	OpenParen,
	Colon,
	Comma,
	SemiColon,
	Tilde,
	"!==",
	"!=",
	"!",
	DotDotDot,
	Dot,
	"/",
	"/=",
	"+=",
	"++",
	Plus,
	"**=",
	"**",
	"*",
	"*=",
	"=>",
	"===",
	"==",
	Equals,
	"<",
	"<=",
	"<<=",
	"<<",
	">=",
	GreaterThanGreaterThanEquals,
	">>=",
	">>>",
	">>",
	">",
	PercentEquals,
	Percent,
	"&=",
	"&&=",
	"&&",
	Ampersand,
	"|=",
	"||=",
	"||",
	Bar,
	"^=",
	Caret,
	"-=",
	"--",
	Minus,
	"??=",
	"??",
	Question,
	QuestionDot,

	// Assignment
	Identifier,
	EscapedKeyword,

	// Keywords
	Break,
	Case,
	Catch,
	Class,
	Const,
	Continue,
	Debugger,
	Default,
	Delete,
	Do,
	Else,
	Enum,
	Export,
	Extends,
	False,
	Finally,
	For,
	Function,
	If,
	Import,
	In,
	Instanceof,
	New,
	Null,
	Return,
	Super,
	Switch,
	This,
	Throw,
	True,
	Try,
	Typeof,
	Var,
	Void,
	While,
	With,
	Implements,
	Interface,
	Package,
	Private,
	Protected,
	Public,
	Static,
	Yield,
}

export const keywords = {
	// Reserved words
	break: Token.Break,
	case: Token.Case,
	catch: Token.Catch,
	class: Token.Class,
	const: Token.Const,
	continue: Token.Continue,
	debugger: Token.Debugger,
	default: Token.Default,
	delete: Token.Delete,
	do: Token.Do,
	else: Token.Else,
	enum: Token.Enum,
	export: Token.Export,
	extends: Token.Extends,
	false: Token.False,
	finally: Token.Finally,
	for: Token.For,
	function: Token.Function,
	if: Token.If,
	import: Token.Import,
	in: Token.In,
	instanceof: Token.Instanceof,
	new: Token.New,
	null: Token.Null,
	return: Token.Return,
	super: Token.Super,
	switch: Token.Switch,
	this: Token.This,
	throw: Token.Throw,
	true: Token.True,
	try: Token.Try,
	typeof: Token.Typeof,
	var: Token.Var,
	void: Token.Void,
	while: Token.While,
	with: Token.With,
	//Strict mode reserved words
	implements: Token.Implements,
	interface: Token.Interface,
	package: Token.Package,
	private: Token.Private,
	protected: Token.Protected,
	public: Token.Public,
	static: Token.Static,
	yield: Token.Yield,
};
