export const keysEnum = (e: Record<string, any>) => {
  return Object.keys(e).filter((key) => isNaN(parseInt(key)))
}

export const valuesEnum = (e: Record<string, any>) => {
  return keysEnum(e).map((key) => e[key])
}

export const objectEnum = (e: Record<string, any>) => {
  return keysEnum(e).reduce(
    (acc, key) => {
      acc[key] = e[key]
      return acc
    },
    {} as Record<string, any>
  )
}

export const stringEnum = (e: Record<string, any>) => {
  const str = keysEnum(e)
    .map((key) => `${key}:${e[key]}`)
    .join(', ')
  return `{ ${str} }`
}

export type Impossible<K extends keyof any> = {
  [P in K]: never
}
export type NoExtra<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>

// export type NoExtra<T, U extends T = T> = U extends Array<infer V>
//     ? NoExtraProperties<V>[]
//     : U & Impossible<Exclude<keyof U, keyof T>>

// https://stackoverflow.com/questions/49580725/is-it-possible-to-restrict-typescript-object-to-contain-only-properties-defined

// export type NoExcess<T> = T & {
//   [K in Exclude<keyof any, keyof T>]?: never
// }

// class Animal {
//   name: string
//   noise: string
// }
// const animal = new Animal()

// const animalBase = {
//   name: 'Dog',
//   noise: 'bark',
// }

// const dog: NoExcess<Animal> = {
//   // why error
//   name: 'Dog',
//   noise: 'bark',
// }

// const cat: NoExcess<Animal> = {
//   name: 'Cat',
//   noise: 'meow',
//   protect: false, // look, an error!
// }

// // What happens if we try to bypass the "Excess Properties Check" done on object literals
// // by assigning it to a variable with no explicit type?
// const fish = {
//   name: 'Rat',
//   noise: 'squeak',
//   swim: false, // look, an error!
// }

// class Bird {
//   name: string
//   noise: string
//   fly: number
// }
// const bird = new Bird()

// function caseOne<T extends Animal>(animal: T & Impossible<Exclude<keyof T, keyof Animal>>): void { }

// function caseTwo<T extends Animal>(animal: NoExtra<Animal, T>): void { }

// function caseThree<T extends Animal>(animal: NoExtra<Animal, T>[]): void { }

// function caseFour(animal: NoExtra<Animal>): void { }

// function caseFive(animal: NoExcess<Animal>): void { }

// function caseSix(animals: NoExcess<Animal>[]): void { }

// // It works for variables defined as the type

// caseOne(animal)
// caseOne(dog)
// caseOne(cat) // doesn't flag it as an error here, but does flag it above
// caseOne(fish) // yay, an error!
// caseOne(bird) // yay, an error!

// caseTwo(animal)
// caseTwo(dog)
// caseTwo(cat) // no error, but error above, so ok
// caseTwo(fish) // yay, an error!
// caseTwo(bird) // yay, an error!

// caseThree([animal])
// caseThree([dog])
// caseThree([cat]) // no error, but error above, so ok
// caseThree([fish]) // yay, an error!
// caseThree([bird]) // yay, an error!

// caseFour(animal)
// caseFour(dog)
// caseFour(cat) // no error, but error above, so ok
// caseFour(fish) // no error, so bad
// caseFour(bird) //  no error, so bad

// caseFive(animal) // error ?? why is this an error?
// caseFive(animalBase) // error ?? why is this an error?
// caseFive(dog)
// caseFive(cat) // no error, but error above, so ok
// caseFive(fish) // yay, an error!
// caseFive(bird) // yay, an error!

// caseSix([animal]) // // error ?? why is this an error?
// caseSix([dog])
// caseSix([cat]) // no error, but error above, so ok
// caseSix([fish]) // yay, an error!
// caseSix([bird]) // yay, an error!
