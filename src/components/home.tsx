import * as React from 'react';

import { Container, Row, Col, Button } from 'react-bootstrap';

import classNames from 'classnames';
import Dropzone from 'react-dropzone';

import { grpc } from 'grpc-web-client';
import { DemService } from '../proto/dem_pb_service';
import { HelloRequest, LongGreetRequest } from '../proto/dem_pb';

const styles = {
  homeLabel: {
    width: '100%',
    borderBottom: '1px solid #c8c8c8',
    fontSize: '13px',
    padding: '8px',
    fontWeight: 500,
    fontFamily: 'Roboto, RobotoDraft, Helvetica, Arial, sans-serif'
  },
  homeCol: {
    padding: '5px'
  }
};


export const Home: React.StatelessComponent<{}> = () => {

  var state = {
    files: [],
    fileName: ''
  };

  function onDrop(_acceptedFiles: any, _rejectedFiles: any) {
    var reader = new FileReader();
    reader.onload = function () {
      var arrayBuffer = reader.result;
      let currentArray = arrayBuffer === null ? JSON.parse("null") : arrayBuffer;
      state.files = currentArray;
      state.fileName = _acceptedFiles[0].name;
    };
    reader.readAsArrayBuffer(_acceptedFiles[0]);
  }

  function UploadToIpfs() {
    const req = new HelloRequest();
    req.setName('888');
    grpc.invoke(DemService.SayHello, {
      request: req,
      host: 'http://localhost:8900',
      onMessage: message => {
        console.log('getBook.onEnd.message', message.toObject());
        console.log(message);
      },
      onEnd: (code: grpc.Code, msg: string | undefined, trailers: grpc.Metadata) => {
        if (code === grpc.Code.OK) {
          console.log('all ok');
        } else {
          console.log('hit an error', code, msg, trailers);
        }
      }
    });

  }
  function UploadHandler() {
    const req = new LongGreetRequest();
    const buffer = Buffer.from(state.files)
    req.setGreeting(buffer);

    const client = grpc.client(DemService.LongGreet, {
      host: "http://localhost:8900",
    });
    client.onHeaders((headers: grpc.Metadata) => {
      console.log("onHeaders", headers);
    });
    client.onMessage((message: any) => {
      console.log("onMessage", message);
    });
    client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => {
      console.log("onEnd", status, statusMessage, trailers);
    });

    client.start(new grpc.Metadata({ "HeaderTestKey1": "ClientValue1" }));
    client.send(req);
    client.finishSend(); // included for completeness, but likely unnecessary as the request is unary

  }
  return (
    <div className="row">
      <Dropzone onDrop={onDrop}>
        {({ getRootProps, getInputProps, isDragActive }) => {
          return (
            <div
              {...getRootProps()}
              className={classNames('dropzone', { 'dropzone--isActive': isDragActive })}
              style={{padding: '20px'}}
            >
          
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <p>Drop files here...</p> :
                  <p>Güvenli bir şekilde ilk dosyanı yükle</p>
              }
            </div>
          );
        }}
      </Dropzone>
      <Button onClick={UploadToIpfs} >Test ME</Button>
      <button onClick={UploadHandler} color="primary">UploadHandler</button>

      <Container style={{ marginTop: '30px' }}>
        <Row className="justify-content-md-center">
          <div style={styles.homeLabel}><span>Son Dosyalar</span></div>
          <Row style={{ padding: '8px' }}>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/200x200" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/200x200" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/200x200" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/200x200" /></a></Col>
          </Row>
        </Row>
        <Row className="justify-content-md-center">
          <div style={styles.homeLabel}><span>Dosyalar</span></div>
          <Row style={{ padding: '8px' }}>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
          </Row>
          <Row style={{ padding: '8px' }}>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
          </Row>
        </Row>
        <Row className="justify-content-md-center">
          <div style={styles.homeLabel}><span>Klasörler</span></div>
          <Row style={{ padding: '8px' }}>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a> </Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
            <Col style={styles.homeCol}><a href="https://placeholder.com"><img src="https://via.placeholder.com/85x85" /></a></Col>
          </Row>
        </Row>
      </Container>;

    </div>
  );
};
