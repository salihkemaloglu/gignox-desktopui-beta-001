import * as React from 'react';
//  import { startIPFSDaemon } from 'src/library/daemon';
// const os = require('os');
// const { ipcMain } = require('electron')
var ipfsClient = require('ipfs-http-client')
export const Home = () => {
  function daemon() {

    // ipcMain.on('isletimSisteminiGetirIstersen', (event: any, arg: any) => {
    //   // bu şekilde uzun sürecek işlemleri tekrar yönlendirme yaparak giderebiliyoruz
    //   event.sender.send('buyurIsletimSistemin', os.platform());
    // });

    // // aynı şekilde renderer (ui) tarafında
    // const { ipcRenderer } = require('electron');

    // ipcRenderer.on('buyurIsletimSistemin', (event: any, arg: any) => {
    //   alert('Bu bilgisayarın işletim sistemi:' + arg);
    // })

    // // bu şekilde istersek bize veri dönmek zorunda olmadığı için hemen diğer satıra geçer
    // ipcRenderer.send('isletimSisteminiGetirIstersen');

  }
  function test() {
    var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
    const buffer = Buffer.from("test");
    let ipfsId = "";
    ipfs.add(buffer, { progress: (prog: any) => console.log(`received: ${prog}`) })
      .then((response: any) => {
        console.log(response)
        ipfsId = response[0].hash
        console.log(ipfsId)
      }).catch((err: any) => {
        console.error(err)
      })
  }
  return (
    <div className="row">
      <span>Home page</span>
      <button onClick={daemon}>start</button>
      <button onClick={test}>test</button>
    </div>
  );
};
