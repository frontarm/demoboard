/*
 * Copyright 2015 James Talmage <james@talmage.io> (github.com/jamestalmage)
 * Licensed under the MIT License (MIT)
 */

function wrapListener(listener: any, name: any, options = {}) {
  return function detective(babel: any) {
    // Babel 6
    return {
      visitor: {
        ImportDeclaration: function(path: any, state: any) {
          return visitImportDeclaration(path, state.file, state.opts)
        },
        CallExpression: function(path: any, state: any) {
          return visitCallExpression(path, state.file, state.opts)
        },
        ExportNamedDeclaration: function(path: any, state: any) {
          return visitExportDeclaration(path, state.file, state.opts)
        },
        ExportAllDeclaration: function(path: any, state: any) {
          return visitExportDeclaration(path, state.file, state.opts)
        },
      },
    }
  }

  function visitExportDeclaration(path: any, file: any, opts: any) {
    if (includeExports(opts) && path.get('source').node) {
      listener(path.get('source'), file, opts)
    }
  }

  function visitImportDeclaration(path: any, file: any, opts: any) {
    if (includeImports(opts)) {
      listener(path.get('source'), file, opts)
    }
  }

  function visitCallExpression(path: any, file: any, opts: any) {
    if (!includeRequire(opts)) {
      return
    }

    var callee = path.get('callee')

    if (callee.isIdentifier() && callee.node.name === word(opts)) {
      var arg = path.get('arguments.0')

      if (arg && (!arg.isGenerated() || includeGenerated(opts))) {
        listener(arg, file, opts)
      }
    }
  }

  // OPTION EXTRACTION:

  function word(opts: any) {
    opts = options || opts
    return (opts && opts.word) || 'require'
  }

  function includeGenerated(opts: any) {
    opts = options || opts
    return Boolean(opts && opts.generated)
  }

  function includeImports(opts: any) {
    opts = options || opts
    return (!opts || opts.import) !== false
  }

  function includeExports(opts: any) {
    opts = options || opts
    return (!opts || opts.export) !== false
  }

  function includeRequire(opts: any) {
    opts = options || opts
    return (!opts || opts.require) !== false
  }
}

function listener(path: any, file: any, opts: any) {
  ;(path.isLiteral() ? addString : addExpression)(path.node, file, opts)
}

function addString(node: any, file: any, opts: any) {
  var val = attachNodes(opts) ? node : node.value
  requireMetadata(file).push(val)
}

// Demoboard doesn't currently support requiring expressions.
function addExpression(node: any, file: any, opts: any) {
  // var val;
  // if (attachNodes(opts)) {
  // 	val = node;
  // } else {
  // 	val = {start: node.start, end: node.end};
  // 	val.loc = {
  // 		start: copyLoc(node.loc.start),
  // 		end: copyLoc(node.loc.end)
  // 	};
  // }
  // if (attachExpressionSource(opts)) {
  // 	val.code = file.code.slice(val.start, val.end);
  // }
  // requireMetadata(file).expressions.push(val);
  // return val;
}

function requireMetadata(file: any) {
  var metadata = file.metadata

  if (!metadata.requires) {
    metadata.requires = []
  }

  return metadata.requires
}

function attachNodes(opts: any) {
  return Boolean(opts && opts.nodes)
}

export default wrapListener(listener, 'detective')
