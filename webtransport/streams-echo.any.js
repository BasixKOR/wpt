// META: global=window,worker
// META: script=/common/get-host-info.sub.js
// META: script=resources/webtransport-test-helpers.sub.js

promise_test(async t => {
  // Establish a WebTransport session.
  const wt = new WebTransport(webtransport_url('echo.py'));
  await wt.ready;

  // Create a bidirectional stream.
  const stream = await wt.createBidirectionalStream();

  // Write a message to the writable end, and close it.
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  await writer.write(encoder.encode('Hello World'));
  await writer.close();

  // Read the data on the readable end.
  const reply = await read_stream(stream);

  // Check that the message from the readable end matches the writable end.
  assert_equals(reply, 'Hello World');
}, 'WebTransport server should be able to create and handle a bidirectional stream');

promise_test(async t => {
  // Establish a WebTransport session.
  const wt = new WebTransport(webtransport_url('echo.py'));
  await wt.ready;

  // Accept a bidirectional stream.
  const stream_reader = wt.incomingBidirectionalStreams.getReader();
  const { value: bidi } = await stream_reader.read();
  stream_reader.releaseLock();

  // Write a message to the writable end, and close it.
  const encoder = new TextEncoderStream();
  encoder.readable.pipeTo(bidi.writable);
  const writer = encoder.writable.getWriter();
  await writer.write('Hello World');
  await writer.close();

  // Read the data on the readable end.
  const reply = await read_stream(bidi);

  // Check that the message from the readable end matches the writable end.
  assert_equals(reply, 'Hello World');
}, 'WebTransport server should be able to accept and handle a bidirectional stream');

promise_test(async t => {
  // Establish a WebTransport session.
  const wt = new WebTransport(webtransport_url('echo.py'));
  await wt.ready;

  // Create a unidirectional stream.
  const writable = await wt.createUnidirectionalStream();

  // Write a message to the writable end, and close it.
  const encoder = new TextEncoderStream();
  encoder.readable.pipeTo(writable);
  const writer = encoder.writable.getWriter();
  await writer.write('Hello World');
  await writer.close();

  // Accept a unidirectional stream.
  const readable = wt.incomingUnidirectionalStreams;

  // Read the message on the readable end.
  const reader = readable.getReader();
  const { value: recv_stream } = await reader.read();
  reader.releaseLock();

  const data = await read_stream(recv_stream);

  // Make sure the data on the writable and readable ends of the streams match.
  assert_equals(data, 'Hello World');
}, 'WebTransport server should be able to create, accept, and handle a unidirectional stream');
