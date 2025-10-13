import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { CaslAction } from "../dto/caslAction.enum";
import { Subject } from "../../subjects/schemas/subject.schema";
import { User } from "../../users/schemas/user.schema";


type Subjects = InferSubjects<typeof Subject | typeof User> | 'all';

export type AppAbility = MongoAbility<[CaslAction, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.role === "ADMIN") {
            can(CaslAction.Manage, 'all'); // read-write access to everything
        } else {
            can(CaslAction.Read, 'all'); // read-only access to everything
        }

        can(CaslAction.Update, Subject, { ownerUuid: user.uuid });
        can(CaslAction.Delete, Subject, { ownerUuid: user.uuid });

        if (user.role === "ADMIN" || user.role === "TEACHER") {
            can(CaslAction.Create, 'all')
        } else {
            cannot(CaslAction.Create, Subject);
            cannot(CaslAction.Update, Subject);
            cannot(CaslAction.Delete, Subject);
        }

        return build({
            // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
            detectSubjectType: (item) => {
                if (item instanceof Subject) {
                    return Subject;
                }
                if (item && item.uuid && item.ownerUuid) {
                    // Fallback for plain objects that resemble a Subject
                    return Subject;
                }
                return item.constructor as ExtractSubjectType<Subjects>;
            },
        });
    }
}
