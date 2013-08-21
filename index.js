var child_process = require('child_process') ;
var _ = require('underscore') ;
var path = require('path') ;
var fs = require('fs') ;
var format = require('util').format ;
var EventEmitter = require('events').EventEmitter ;

var Worker = function () { this.setOpts.apply(this,arguments) };

Worker.prototype.setOpts = function(fnOrPath){
  
  var _this = this ;
  
  _this.opts = {} ;
  
  if ( _.isString( fnOrPath ) ) {
  
    if ( fs.existsSync( fnOrPath ) ) {
    
      _this.opts.module = fnOrPath ;
    
    } else {
    
      throw new Error('Path to worker function does not exist.')
    
    }
  
  } else if ( _.isFunction( fnOrPath ) ) {
  
    _this.opts.fn = fnOrPath.toString() ;
  
  } else {
  
    throw new Error('Invalid worker function provided') ;
  
  }
  
};

Worker.prototype.spawn = function (){
  
  var _this = this ;
  
  var child = new Child(child_process.fork( path.join( __dirname , './worker' ) )) ;
  
  var args = _.toArray(arguments) ;
  
  if ( _this.opts.module ) {
    
    child.send({ module : _this.opts.module }) ;
    
  } else if ( _this.opts.fn ) {
    
    child.send({ fn : _this.opts.fn }) ;
    
  }
  
  child.send({ process : args }) ;
  
  return child ;
  
};

function Child (child) {
  
  var _this = this ;
  
  _this.child_process = child ;
  
  _this.child_process.on('message',function(m){
    
    if ( m._type ) {
      
      _this.emit.apply( _this , [m._type].concat( m.args ) ) ;
      
    }
    
  });
  
}

Child.prototype.__proto__ = EventEmitter.prototype;

Child.prototype.send = function ( m , fd ) {
  
  this.child_process.send( m , fd ) ;
  
};

Child.prototype.kill = function ( sig ) {
  
  this.child_process.kill( sig ) ;
  
};


exports.Worker = Worker ;
