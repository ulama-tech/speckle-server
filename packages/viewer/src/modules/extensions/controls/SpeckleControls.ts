import { OrthographicCamera, PerspectiveCamera, Sphere, Vector3 } from 'three'
import EventEmitter from '../../EventEmitter.js'

export abstract class SpeckleControls extends EventEmitter {
  protected _up: Vector3 = new Vector3(0, 1, 0)
  protected _minDist: number = 0

  public get up() {
    return this._up
  }
  public set up(value: Vector3) {
    this._up.copy(value)
  }

  public get minDist() {
    return this._minDist
  }

  public set minDist(value: number) {
    this._minDist = value
  }

  abstract get options(): Partial<Record<string, unknown>>
  abstract set options(value: Partial<Record<string, unknown>>)

  abstract get enabled(): boolean
  abstract set enabled(value: boolean)
  abstract set targetCamera(target: PerspectiveCamera | OrthographicCamera)

  abstract isStationary(): boolean
  abstract update(delta?: number): boolean
  abstract jumpToGoal(): void
  abstract fitToSphere(sphere: Sphere): void
  abstract dispose(): void

  abstract fromPositionAndTarget(position: Vector3, target: Vector3): void
  abstract getTarget(): Vector3
  abstract getPosition(): Vector3
  abstract getCurrentTarget(): Vector3
  abstract getCurrentPosition(): Vector3
}
