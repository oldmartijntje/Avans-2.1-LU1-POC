import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { CaslAction } from "../dto/caslAction.enum";
import { Subject } from "../../subjects/schemas/subject.schema";
import { User } from "../../users/schemas/user.schema";
import { DisplayText } from "../../display-text/schemas/display-text.schema";
import { Course } from "../../course/schema/course.schema";


type Subjects = InferSubjects<typeof Subject | typeof User | typeof Course | typeof DisplayText> | 'all';

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


        if (user.role === "ADMIN" || user.role === "TEACHER") {
            can(CaslAction.Create, 'all');
            can(CaslAction.Update, 'all');
            can(CaslAction.Delete, 'all');
        } else {
            can(CaslAction.Update, Subject, { ownerUuid: user.uuid });
            can(CaslAction.Delete, Subject, { ownerUuid: user.uuid });
            cannot(CaslAction.Create, Subject);
            cannot(CaslAction.Update, Subject);
            cannot(CaslAction.Delete, Subject);
            cannot(CaslAction.Create, DisplayText);
            cannot(CaslAction.Update, DisplayText);
            cannot(CaslAction.Delete, DisplayText);
            cannot(CaslAction.Create, Course);
            cannot(CaslAction.Update, Course);
            cannot(CaslAction.Delete, Course);
        }

        return build({
            // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
            detectSubjectType: (item) => {
                if (item instanceof Subject) {
                    return Subject;
                }
                if (item instanceof DisplayText) {
                    return DisplayText;
                }
                if (item instanceof Course) {
                    return Course;
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
