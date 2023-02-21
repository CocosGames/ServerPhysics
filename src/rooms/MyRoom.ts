import {Client, Room} from "colyseus";
import {MyRoomState, Player} from "./schema/MyRoomState";
import {b2Body, b2BodyType, b2CircleShape, b2PolygonShape, b2Shape, b2ShapeType, b2Vec2, b2World} from "@box2d/core";
import * as level from "./level.json";

export class MyRoom extends Room<MyRoomState> {

    public world: b2World = null;
    public playerBodies: Map<string, b2Body> = new Map<string,b2Body>();


    onCreate(options: any) {
        this.setState(new MyRoomState());
        this.setPatchRate(1000/24);
        this.autoDispose = false;
        const gravity: b2Vec2 = new b2Vec2(0, -10);
        this.world = b2World.Create(gravity);
        const box: b2PolygonShape = new b2PolygonShape();
        box.SetAsBox(1,1);
        level.map.forEach((v, i, a) => {
            this.world.CreateBody({
                type: b2BodyType.b2_staticBody,
                position: new b2Vec2(v.x, v.y)
            }).CreateFixture({shape: box});
        });

        this.clock.setInterval(() => {
            // this.world.ClearForces();
            this.world.Step(1 / 5, {velocityIterations: 5, positionIterations: 5});
            this.playerBodies.forEach((b,k,m)=>{
                let pos = b.GetPosition();
                let p = this.state.players.get(k);
                if (p)
                {
                    p.x = pos.x;
                    p.y = pos.y;
                }
            })
        }, 100);

        console.log("Room created!");

        this.onMessage("move", (client, message) => {
            let v = this.playerBodies.get(client.sessionId).GetLinearVelocity();
            if (message.dir == "l")
                this.playerBodies.get(client.sessionId).SetLinearVelocity(new b2Vec2(-3, v.y));
            else if (message.dir == "r")
                this.playerBodies.get(client.sessionId).SetLinearVelocity(new b2Vec2(3, v.y));
        });
        this.onMessage("stop", (client, message) => {
            let v = this.playerBodies.get(client.sessionId).GetLinearVelocity();
            this.playerBodies.get(client.sessionId).SetLinearVelocity(new b2Vec2(0, v.y));
        });
        this.onMessage("jump", (client, message) => {
            let c = this.playerBodies.get(client.sessionId).GetWorldCenter();
            this.playerBodies.get(client.sessionId).ApplyLinearImpulse(new b2Vec2(0,10), c);
        });
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");

        let b = this.world.CreateBody({type: b2BodyType.b2_dynamicBody, position:new b2Vec2(20,20)});
        b.SetFixedRotation(true);
        b.SetLinearDamping(0);
        let s1:b2Shape = new b2CircleShape(0.4).Set(new b2Vec2(-0.4,0.4));
        // let s2:b2Shape = new b2CircleShape(0.4).Set(new b2Vec2(-0.4,0.8));
        b.CreateFixture({shape: s1, density: 1, friction:0});
        // b.CreateFixture({shape: s2, density: 1, friction:0});
        this.state.players.set(client.sessionId, new Player());
        this.playerBodies.set(client.sessionId, b);
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        this.state.players.delete(client.sessionId);
        this.world.DestroyBody(this.playerBodies.get(client.sessionId))
        this.playerBodies.delete(client.sessionId);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
