import { UploadCleaner } from "./tasks/uploadCleaner";
import { UnpaidConsultationCleaner } from "./tasks/unpaidConsultationCleaner";
import { UserConsultationReminder, AdminConsultationReminder } from "./tasks/consultationReminder";
import { ConsultationFinisher } from "./tasks/consultationFinisher";

export default () => {
    UploadCleaner.start();
    UnpaidConsultationCleaner.start();
    UserConsultationReminder.start();
    AdminConsultationReminder.start();
    ConsultationFinisher.start();
};
