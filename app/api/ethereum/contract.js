import path from 'path'
import fs from 'fs'

export default class Contract {
  constructor (name, fileName, web3) {
    this.name = name
    this.fileName = fileName
    this.web3 = web3
  }

  load (address) {
    this.loadPromise = new Promise((resolve, reject) => {
      this.getSource(this.fileName).then((source) => {
        this.web3.eth.compile.solidity(source, (err, compiled) => {
          if (err) return reject(err)

          const code = compiled.code;
          const abi = compiled.info.abiDefinition;

          if (address) {
            const contract = this.web3.eth.contract(abi).at(address)
            this.contract = contract;
            resolve(this.contract)
          } else {
            this.web3.eth.contract(abi).new({data: code}, (err, contract) => {
              if (err) return reject(err)

              if (contract.address) {
                this.contract = contract;
                resolve(this.contract)
              }
            })
          }
        })
      }).catch(reject)
    })

    return this.loadPromise
  }

  getContract (address) {
    if (this.loadPromise) return this.loadPromise

    return new Promise((resolve, reject) => {
      this.load(address).then(resolve).catch(reject)
    })
  }

  getSource (contractName) {
    const filePath = path.join(__dirname, `contracts/${contractName}.sol`)
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return reject(err)

        resolve(data)
      })
    })
  }
}
