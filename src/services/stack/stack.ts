// eslint-disable-next-line no-restricted-syntax
export class Stack {
  private items: string[]
  private length: number
  // Array is used to implement stack
  constructor (length: number)
  {
    this.items = []
    this.length = length
  }

  push (element:string): void
  {
    if (this.items.length === this.length){
      this.pop()
    }
    this.items = [element, ...this.items]
    console.log(this.items)
  }
  pop (): string
  {
    if (this.items.length === 0)
    {
      throw new Error('UNDERFLOW')
    }

    return <string> this.items.pop()
  }

  get (position: number): string
  {

    console.log(this.items[position], position)

    return this.items[position]
  }

  getLength (): number{
    return this.items.length
  }
}
