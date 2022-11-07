import axios from 'axios'
import crypto from 'crypto'
import * as html from 'node-html-parser';
import { EventEmitter } from 'stream';

function hash (data: string) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

export enum NotificationType {
  FIRST_RESTOCK = 'first_restock',
  RENOTIFY_RESTOCK = 'renotify_restock',
  OUT_OF_STOCK = 'out_of_stock',
  ERROR = 'error'
}

export class Product {
  private timer: NodeJS.Timer
  private available: boolean = false
  private delayBetweenAlerts: number = 1000 * 60
  private lastAlertTimestamp: number = new Date().getDate()

  constructor (
    public hash: string,
    public name: string,
    public url: string,
    public selector: string,
    public interval: number,
    private _channel: EventEmitter
  ) {
    // Initializes the timer
    this.timer = setInterval(this.update.bind(this), interval)
  }

  notify (type: string) {
    this._channel.emit(type, this)
  }

  async update () {
    try {
      console.log('[UPDATE]', this.name, this.url)

      const { data } = await axios.get(this.url)
      const root = html.parse(data)
      const result = root.querySelector(this.selector)

      // Should dispatch an event to inform the restock
      // of the current item
      if (result && !this.available) {
        this.available = true
        this.lastAlertTimestamp = +new Date()
        this.notify(NotificationType.FIRST_RESTOCK)
      }

      if (result && this.available) {
        const now = +new Date()
        const delta = now - this.lastAlertTimestamp

        if (delta > this.delayBetweenAlerts) {
          this.lastAlertTimestamp = now
          this.notify(NotificationType.RENOTIFY_RESTOCK)
        }
      }

      // Should dispatch an event to inform the product
      // went out of stock
      if (!result && this.available) {
        this.available = false
        this.notify(NotificationType.OUT_OF_STOCK)
      }
    } catch (error) {
      console.log(error)
    }
  }

  cancel () {
    clearInterval(this.timer)
  }
}


export default class Worker extends EventEmitter {
  private jobs = new Map()

  add (name: string, url: string, selector: string, interval: number) {
    const _hash = hash(url)
    const _product = new Product(_hash, name, url, selector, interval, this)

    this.jobs.set(_hash, _product)
  }
}