'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const net = require('net');

const {
  TelnetServer,
  TelnetSocket,
  Sequences,
  Options,
} = require('..');

class FakeConnection extends EventEmitter {
  constructor() {
    super();
    this.ended = false;
    this.finished = false;
    this.readable = true;
    this.writable = true;
    this.fresh = false;
    this.writes = [];
  }

  write(data) {
    this.writes.push(data);
  }

  setEncoding() {}

  pause() {}

  resume() {}

  destroy() {}

  address() {
    return null;
  }
}

describe('TelnetServer', () => {
  it('marks accepted sockets as fresh', (done) => {
    const server = new TelnetServer((socket) => {
      try {
        assert.strictEqual(socket.fresh, true);
      } finally {
        socket.destroy();
        server.netServer.close(done);
      }
    });

    server.netServer.listen(0, () => {
      const port = server.netServer.address().port;
      const client = net.connect(port);
      client.on('error', done);
    });
  });
});

describe('TelnetSocket input parsing', () => {
  it('filters control bytes and emits data when not fresh', (done) => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    socket.on('data', (data) => {
      try {
        assert.strictEqual(data.toString(), 'AB');
        done();
      } catch (error) {
        done(error);
      }
    });

    socket.input(Buffer.from([0x01, 0x41, 0x02, 0x42]));
  });

  it('suppresses data emission when fresh, then clears fresh', () => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: true };

    let dataEmitted = false;
    socket.on('data', () => {
      dataEmitted = true;
    });

    socket.input(Buffer.from('hello'));

    assert.strictEqual(dataEmitted, false);
    assert.strictEqual(socket.socket.fresh, false);
  });

  it('emits negotiation events for DO/DONT/WILL/WONT', () => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    const events = [];
    socket.on('DO', (opt) => events.push(['DO', opt]));
    socket.on('DONT', (opt) => events.push(['DONT', opt]));
    socket.on('WILL', (opt) => events.push(['WILL', opt]));
    socket.on('WONT', (opt) => events.push(['WONT', opt]));

    socket.input(Buffer.from([
      Sequences.IAC, Sequences.DO, 0x12,
      Sequences.IAC, Sequences.DONT, 0x13,
      Sequences.IAC, Sequences.WILL, 0x14,
      Sequences.IAC, Sequences.WONT, 0x15,
    ]));

    assert.deepStrictEqual(events, [
      ['DO', 0x12],
      ['DONT', 0x13],
      ['WILL', 0x14],
      ['WONT', 0x15],
    ]);
  });

  it('updates gaMode for EOR negotiations without emitting DO/DONT', () => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    let emitted = false;
    socket.on('DO', () => {
      emitted = true;
    });

    socket.input(Buffer.from([Sequences.IAC, Sequences.DO, Options.OPT_EOR]));

    assert.strictEqual(emitted, false);
    assert.strictEqual(socket.gaMode, Sequences.EOR);

    socket.input(Buffer.from([Sequences.IAC, Sequences.DONT, Options.OPT_EOR]));
    assert.strictEqual(socket.gaMode, Sequences.GA);
  });

  it('emits unknownAction for unsupported commands', (done) => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    socket.on('unknownAction', (cmd, opt) => {
      try {
        assert.strictEqual(cmd, 0x99);
        assert.strictEqual(opt, 0x01);
        done();
      } catch (error) {
        done(error);
      }
    });

    socket.input(Buffer.from([Sequences.IAC, 0x99, 0x01]));
  });

  it('parses GMCP subnegotiation and emits GMCP event', (done) => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    const gmcpPayload = 'Core.Hello {"client":"test"}';
    const gmcpBuffer = Buffer.concat([
      Buffer.from([Sequences.IAC, Sequences.SB, Options.OPT_GMCP]),
      Buffer.from(gmcpPayload),
      Buffer.from([Sequences.IAC, Sequences.SE]),
    ]);

    socket.on('GMCP', (gmcpPackage, data) => {
      try {
        assert.strictEqual(gmcpPackage, 'Core.Hello');
        assert.deepStrictEqual(data, { client: 'test' });
        done();
      } catch (error) {
        done(error);
      }
    });

    socket.input(gmcpBuffer);
  });

  it('emits GMCP with null payload when only package is present', (done) => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    const gmcpPayload = 'Core.Ping';
    const gmcpBuffer = Buffer.concat([
      Buffer.from([Sequences.IAC, Sequences.SB, Options.OPT_GMCP]),
      Buffer.from(gmcpPayload),
      Buffer.from([Sequences.IAC, Sequences.SE]),
    ]);

    socket.on('GMCP', (gmcpPackage, data) => {
      try {
        assert.strictEqual(gmcpPackage, 'Core.Ping');
        assert.strictEqual(data, null);
        done();
      } catch (error) {
        done(error);
      }
    });

    socket.input(gmcpBuffer);
  });

  it('passes through SUBNEG data for non-GMCP options', (done) => {
    const socket = new TelnetSocket();
    socket.socket = { fresh: false };

    const subnegPayload = Buffer.from('abc');
    const subnegBuffer = Buffer.concat([
      Buffer.from([Sequences.IAC, Sequences.SB, 0x7b]),
      subnegPayload,
      Buffer.from([Sequences.IAC, Sequences.SE]),
    ]);

    socket.on('SUBNEG', (opt, buffer) => {
      try {
        assert.strictEqual(opt, 0x7b);
        assert.strictEqual(buffer.toString(), 'abc  ');
        done();
      } catch (error) {
        done(error);
      }
    });

    socket.input(subnegBuffer);
  });
});

describe('TelnetSocket output and attach behaviors', () => {
  it('does not duplicate IAC bytes during write', () => {
    const socket = new TelnetSocket();
    const fake = new FakeConnection();
    socket.socket = fake;

    const data = Buffer.from([Sequences.IAC]);
    socket.write(data);

    assert.strictEqual(fake.writes.length, 1);
    assert.strictEqual(fake.writes[0].length, 1);
    assert.strictEqual(fake.writes[0][0], Sequences.IAC);
  });

  it('emits data for bytes before and after a newline due to current look-ahead behavior', (done) => {
    const socket = new TelnetSocket();
    const connection = new FakeConnection();
    connection.fresh = false;

    socket.attach(connection);

    const outputs = [];
    socket.on('data', (data) => {
      outputs.push(data.toString());
      if (outputs.length < 2) {
        return;
      }
      if (outputs.length > 2) {
        done(new Error(`Unexpected extra data event: ${outputs[outputs.length - 1]}`));
        return;
      }
      try {
        assert.deepStrictEqual(outputs, ['A', 'B']);
        done();
      } catch (error) {
        done(error);
      }
    });

    connection.emit('data', Buffer.from('A\nB'));
  });
});
